const users = require("../models/users")();

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\                     Access Level Security                             \\\\\\\\\\\\\\\\\\\
//\\                      Only Admin has access to:                         \\\\\\\\\\\\\\\\\\\
//\\                      Get all users; Get users by ID; Add new user      \\\\\\\\\\\\\\\\\\\
//\\                                                                        \\\\\\\\\\\\\\\\\\\
//\\                                                                        \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
exports.accessLevel = async (req, res, next) => {
  console.log(" ---auth.accessLevel --- ");
  console.log("access level", this.currentUser);
  try {
    console.log(this.currentUser.userId);
    if ((await this.currentUser.userType) != "admin") {
      // check if user is admin, if not, reject access to the route
      //and print informations of the current user on the screen
      const { result, error } = await users.get(this.currentUser.userId);
      if (error) {
        res.status(500).json({ error });
      }
      const results = { user: result, Security: "Restrict Access" };
      console.log("Restrict Access");
      return res.status(401).json(results);
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
