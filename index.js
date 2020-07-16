const jwt = require("jsonwebtoken");

/**
 * option values:
 * - privateKey => "......"
 * - needAuthPaths => ["^/*"]
 * - needAuthPathsExcept => ["^/auth/*", "^/public/*"]
 * - expiresIn => 1 (millisecond) | 1ms (millisecond) | 1s (second) | 1m (minute) | 1h (hour) | 1d (day) | 1w (week) | 1y (year)
 * - algorithm => "HS256" | ...
 * - logger => logging function
 * - additionalAuthorize => additional Check Function
 */
function createAuthorizer(option) {
    //유효성 검증
    if (
        Array.isArray(option.needAuthPaths) == false &&
        option.needAuthPaths != undefined
    ) {
        throw new Error(
            `Bad needAuthPath Value. It should be String|RegExp Array value. your input: ${option.needAuthPaths}`
        );
    }

    if (
        Array.isArray(option.needAuthPathsExcept) == false &&
        option.needAuthPathsExcept != undefined
    ) {
        throw new Error(
            `Bad needAuthPathsExcept Value. It should be String|RegExp Array value. your input: ${option.needAuthPathsExcept}`
        );
    }

    if (option.privateKey !== String(option.privateKey)) {
        console.log(
            "!!!: No key value was entered or an incorrect key value was entered. It is recommended to pass the correct string key value."
        );
    }

    if (option.expiresIn !== String(option.expiresIn)) {
        console.log(
            "### No expiresIn value was entered or an incorrect expireIn value was entered. default value is an hour('1h')"
        );
    }

    const validatePathValues = (e) => {
        if (e === String(e)) {
            return new RegExp(e);
        } else if (e instanceof RegExp) {
            return e;
        } else {
            throw new Error(
                `Bad Path Value. You need to insert string or regexp value: ${e}`
            );
        }
    };

    // 인증이 필요한 경로값 배열
    const needAuthPaths = (option.needAuthPaths || []).map(validatePathValues);

    // 인증이 필요하지 않은 경로값 배열
    const needAuthPathsExcept = (option.needAuthPathsExcept || []).map(
        validatePathValues
    );

    const expiresIn = option.expiresIn || "1h";

    // 'RS256', 'RS384', 'RS512',
    // 'HS256', 'HS384', 'HS512',
    // 'PS256', 'PS384', 'PS512',
    // 'ES256', 'ES384', 'ES512'
    const algorithm = option.algorithms || "HS256";

    // 암호화를 위한 키값
    const privateKey = option.privateKey || "foobar";

    // 추가 체크. 세션값 등.
    // true이면 성공
    const additionalAuthorize =
        option.additionalAuthorize || ((req, res, next) => true);

    // 오류 로깅 함수
    const logger = option.logger || console.log;

    // 미들웨어
    return async function (req, res, next) {
        req.authorizer = {
            authorized: false,
            //로그인 토큰 반환
            makeToken: (values) => {
                const token = jwt.sign(values, privateKey, {
                    expiresIn,
                    algorithm,
                });

                return token;
            },

            //로그인 토큰 갱신
            refreshToken: (req, res, next) => {
                req.authorizer.authorize();
                const oldTokenValue = req.authorizer.tokenValue;
                delete oldTokenValue.iat;
                delete oldTokenValue.exp;
                delete oldTokenValue.nbf;
                delete oldTokenValue.jti;

                return req.authorizer.makeToken(oldTokenValue);
            },

            //인증 수행
            authorize: (req, res, next) => {
                req.authorizer.tokenValue = {};
                try {
                    req.authorizer.tokenValue = jwt.verify(token, privateKey);
                    logger(
                        `### decoded token value >>> ${req.authorizer.tokenValue}`
                    );

                    if (additionalAuthorize(req, res, next) == false) {
                        throw new Error("additionalAuthorize failed");
                    }

                    req.authorizer.authorized = true;

                    return;
                } catch (error) {
                    logger(error);
                    res.status(401).json({
                        success: false,
                        msg: "login failed",
                    });
                    return;
                }
            },
        };

        const token = req.headers.authorization;
        const path = req.originalUrl;

        const needAuth = needAuthPaths.some((e) => e.test(path));
        const needAuthExcept = needAuthPathsExcept.some((e) => e.test(path));

        //인증 대상
        if (needAuth && !needAuthExcept) {
            if (token !== String(token)) {
                res.status(401).json({
                    success: false,
                    msg: "need authorization token",
                });
                return;
            }

            req.authorizer.authorize(req, res, next);

            if (req.authorizer.authorized) {
                next();
            }
        }
        //인증 대상 아님
        else {
            req.authorizer.authorized = false;
            next();
        }
    };
}

module.exports = createAuthorizer;
