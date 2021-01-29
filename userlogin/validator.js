const { check, validationResult } = require("express-validator");

const checkValidation = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};
exports.validateLogin = [
  check("email")
    .normalizeEmail({ gmail_remove_dots: false })
    .notEmpty()
    .withMessage("Email cannot be blank")
    .bail()
    .isEmail()
    .withMessage("Email is not valid"),
  check("key")
    .isLength(5)
    .withMessage("Key must be at least 5 characters long"),
  checkValidation,
];
exports.validateUser = [
  check("name").notEmpty().withMessage("Name cannot be blank"),
  check("userType")
    .notEmpty()
    .withMessage("userType cannot be blank")
    .bail()
    .isIn(["admin", "user"])
    .withMessage("userType must be admin or user"),
  check("email")
    .normalizeEmail({ gmail_remove_dots: false })
    .notEmpty()
    .withMessage("Email cannot be blank")
    .bail()
    .isEmail()
    .withMessage("Email is not valid"),
  check("key")
    .isLength(5)
    .withMessage("Key must be at least 5 characters long"),
  checkValidation,
];
