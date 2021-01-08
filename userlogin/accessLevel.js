const users = require("../models/users")();
const auth = require("../userlogin/auth");

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\                     Access Level Security                             \\\\\\\\\\\\\\\\\\\
//\\                      Only Admin has access to:                         \\\\\\\\\\\\\\\\\\\
//\\                      Get all users; Get users by ID; Add new user      \\\\\\\\\\\\\\\\\\\
//\\                                                                        \\\\\\\\\\\\\\\\\\\
//\\                                                                        \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
exports.accessLevel = async (req, res, next) => {
  console.log(" ---accessLevel --- ");
  console.log("access level", auth.currentUser);
  try {
    console.log(auth.currentUser.userId);
    if ((await auth.currentUser.userType) != "admin") {
      // check if user is admin, if not, reject access to the route
      //and print informations of the current user on the screen
      const { result, error } = await users.get(auth.currentUser.userId);
      if (error) {
        res.status(500).json({ error });
      }
      const results = { users: result, Security: "Restrict Access" };
      console.log("Restrict Access");
      return res.status(401).json(results);
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
