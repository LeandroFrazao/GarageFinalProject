const jwt = require("jsonwebtoken");
const token = require("./login");

exports.auth = (req, res, next) => {
  //\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  //\\                 Verify Token from cookie                               \\\\\\\\\\\\\\\\\\\
  //\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  try {
    //get the token from the cookie jwt
    //console.log(req.cookies.jwt);
    //console.log(req.headers.authorization.split(" ")[1]);

    let accessToken = req.cookies.jwt;
    console.log("accessToken", accessToken);
    console.log(req.headers.authorization.split(" ")[1]);
    if (!accessToken) {
      accessToken = req.headers.authorization.split(" ")[1];
    }

    //check if cookie exist, otherwise return an error
    if (!accessToken) {
      return res.status(403).send({
        error: "Need to Login, go to:  '/login' and user your credencials ",
      });
    }
    //console.log(token.RANDOM_TOKEN);
    // import the random string from token.js
    const RANDOM_TOKEN = token.RANDOM_TOKEN;
    //const RANDOM_TOKEN = "ger'sgarage";

    //Check whether the token is valid, if not, it returns an error.
    const decodedToken = jwt.verify(accessToken, RANDOM_TOKEN);
    //onsole.log(decodedToken);
    const userType = decodedToken.userType;
    const userId = decodedToken.userId;
    const userEmail = decodedToken.userEmail;
    console.log(userType);
    module.exports.currentUser = { userType, userId, userEmail };
    next();
  } catch (error) {
    error = "Access Denied";
    res.status(401);
    //res.json({ error: error });
    res.error = { error: error };
    return res.redirect("/");
  }
};
