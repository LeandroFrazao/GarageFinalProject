const db = require("../db")();
var crypto = require("crypto");
const jwt = require("jsonwebtoken");
const userHashKey = require("../userlogin/hash")();
const users = require("../models/users")();
const nodemailer = require("nodemailer");
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\                       Register NEW USER                                \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
exports.register = async (req, res, next) => {
  console.log(
    " --- register.register -------------------------------------------------- "
  );
  if (res.error) {
    console.log(res.error);
    next();
  } else {
    var newUser = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      userType: req.body.userType,
      key: req.body.key,
    };
    // console.log(newUser);
    let user = await db.get("users", { email: newUser.email });
    console.log("From users: ", user[0]);
    //if user is already resgistered, return an error
    if (user[0]) {
      console.log("Email already registered.");
      res.error = "Email already registered.";
      //return next();
      return res.status(500).json({ error: "Email already registered." });
    }
    let hashKey = await userHashKey.hash(newUser.key); // call a function to hash the user key

    // replace a document if it was found, or create a new one.

    const randomToken = crypto.randomBytes(20).toString("hex");
    //const randomToken = "ger'sgarage"; // test
    console.log("RANDOMTOKEN: ", randomToken);

    console.log(hashKey);

    const token = jwt.sign(
      {
        user: req.body.email,
      },
      randomToken,
      {
        expiresIn: "1h", //one hour
      }
    );
    res.cookie("vrf", token, { secure: false, httpOnly: true });

    user = await db.replace(
      "tempUsers",
      { email: newUser.email },
      {
        token: token,
        randomToken: randomToken,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        phone: newUser.phone,
        address: newUser.address,
        city: newUser.city,
        key: hashKey,
      }
    );
    console.log("From tempUsers: ", user);

    //message for the user
    const msgToUser = {
      user: "A verification email has been sent to " + req.body.email,
      Information:
        "Token wil expire in 1 hour. Token was sent in a cookie named vrf",
      token: token,
    };

    // create a message that is going to be sent by email
    var mailOptions = {
      from: "no-reply@gmail.com",
      to: req.body.email,
      subject: "Account Verification Token",
      text:
        "Hello,\n\n" +
        "Please verify your account by clicking the link: \nhttp://" +
        req.headers.host +
        "/verify/" +
        randomToken +
        ".\n",
    };
    console.log(" >>>  Token: " + token);

    const decodedToken = jwt.verify(token, randomToken);
    console.log("DecodeToken: ", decodedToken.user);

    //load enviroment variables for email server
    const userEmail = process.env.APIEMAIL;
    const passEmail = process.env.APIPASS;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.mail.gmail.com",
      port: 587,
      security: true,
      auth: {
        user: userEmail,
        pass: passEmail,
      },
    });
    transporter.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready for messages");
      }
    });

    transporter.sendMail(mailOptions, function (err) {
      if (err) {
        console.log("error to send email");
        res.error = "error to send email";
        return next();
        // return res.status(501).send({ msg: err.message });
      }
      console.log("To send email to: ", req.body.email);
      res.success = msgToUser.user;
      res.status(200).send({
        user: msgToUser.user,
        Information: msgToUser.Information,
        Token: msgToUser.token,
      });
    });
  }
};

exports.confirmation = async (req, res, next) => {
  console.log("--------register.confirmation----------");
  try {
    const randomToken = req.params.randomtoken; // randomToken that was sent by email
    let accessToken = req.cookies.vrf; //get the token from the cookie vrf
    //console.log("cookie: ", accessToken);
    // console.log("RandomToken: ", randomToken);
    //check if cookie exist, otherwise return an error
    if (!accessToken) {
      //res.error = "No cookie found. Need to Register, go to:  '/register' ";
      let userToken = await db.get("tempUsers", { randomToken: randomToken });
      // console.log(userToken);
      if (userToken[0]) {
        accessToken = userToken[0].token;
      } else {
        res.error = {
          error: "No cookie found. Need to Register, go to:  '/register' ",
        };
        // return res.status(403).send({ error: "No cookie found. Need to Register, go to:  '/register' ",});
        res.status(403);
        return res.redirect("/invalid.html");
      }
    }
    // verify token is valid
    const decodedToken = jwt.verify(accessToken, randomToken);
    //console.log("DecodeToken: ", decodedToken.user);

    //check if user is already verified
    let user = await db.get("users", { email: decodedToken.user });
    if (user[0]) {
      res.success = "The account has been verified. Please log in. ";
      //return res.status(400).send({ msg: "The account has been verified. Please log in." });
      res.status(400);
      return res.redirect("/verified.html");
    }

    //check whether email exists in the tempUsers collection in mongoDB
    user = await db.get("tempUsers", { email: decodedToken.user });
    if (!user[0]) {
      res.error = "User Not Found for this token.";
      console.log(res.error);
      //return res.status(400).send({ msg: "User Not Found for this token." });
      res.status(400);
      return res.redirect("/invalid.html");
    }
    //console.log("user from Token: ", user[0]);
    //  after token is verified, the user account is copied from tempUsers to users collections
    const results = await db.add("users", {
      name: user[0].name,
      email: user[0].email,
      userType: user[0].userType,
      phone: user[0].phone,
      address: user[0].address,
      city: user[0].city,
      key: user[0].key,
    });
    //then, after user document is added in users collection, data from tempUsers is deleted.
    await db.deleteOne("tempUsers", { _id: user[0]._id });
    console.log("user from tempUser deleted: ", results.ops);
    //res.status(200).send({ msg: "The account has been verified. Please log in." });
    res.status(400);
    return res.redirect("/verified.html");
  } catch (e) {
    res.error = "Your token expired.";
    //res.status(400).send({ msg: "Your token expired." });
    res.status(400);
    return res.redirect("/expired.html");
  }
};
