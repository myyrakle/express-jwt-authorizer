# express-jwt-authorizer

![](https://img.shields.io/badge/language-Javascript-red) ![](https://img.shields.io/badge/version-0.1.1-brightgreen) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/myyrakle/express-jwt-authorizer/blob/master/LICENSE)

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
