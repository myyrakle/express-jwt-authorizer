# express-jwt-authorizer

![](https://img.shields.io/badge/language-Javascript-red) ![](https://img.shields.io/badge/version-0.1.1-brightgreen) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/myyrakle/express_template/blob/master/LICENSE)

Express middleware that automatically performs authentication.

#

you can install it as below

```
npm install --save express-jwt-authorizer
```

#

And you can use it in the same way as the code below.

```
const express = require("express");
const app = express();
......
const authorizer = require("express-jwt-authorizer");
const key = require("./key/key"); //key value
app.use(
    authorizer({
        needAuthPaths: ["^/*"],
        needAuthPathsExcept: ["^/auth/*"],
        privateKey: key.privateKey,
        expireIn: "1h",
    })
);
```

#
...then 
```
// get login token
const token = req.authorizer.getToken({user_no:10, user_type:'U'});
```

```
// check authorization. true or false
req.authorizer.authorized
```

```
// If authorized, the token value will be stored.
req.authorizer.tokenValue
```

```
// Authentication is performed by receiving the token value from the authorization of the header. 
// It is not necessary to use it directly.
req.authorizer.authorize(req, res, next);
```