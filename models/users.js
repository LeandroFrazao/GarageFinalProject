const db = require("../db")();
const userHashKey = require("../userlogin/hash")();
const COLLECTION = "users";
const ObjectID = require("mongodb").ObjectID;
const auth = require("../userlogin/auth");
const { logout } = require("../userlogin/login");

module.exports = () => {
  ///////////////////////////////////////////////////////////////////////////
  /////Get all users "{GET} /users"/////////////////////////////////////////
  ////Or                           ////////////////////////////////////////
  /////Get individual users "{GET} /users/{EMAIL}" or { _id}//////////////
  ///////////////////////////////////////////////////////////////////////
  const get = async (id = null) => {
    console.log(" --- usersModel.get --- ");
    var users = null; //initialize variable

    try {
      // load the active user email who is logged in.
      const userEmail = auth.currentUser.userEmail;

      // check if id is null or empty
      if (!id) {
        users = await db.get(COLLECTION);
        if (users.length == 0) {
          error = "No Users Registered";
          return { error: error };
        }
      } else {
        //const email = id.toLowerCase();

        const email = userEmail;

        if (ObjectID.isValid(id)) {
          //check if object is valid
          PIPELINE_ID_OBJECT_OR_EMAIL = {
            //if objectID(id) is valid, so the query is going to try to find BOTH _id or SLUG
            $or: [{ _id: ObjectID(id) }, { email: email }],
          };
          users = await db.get(COLLECTION, PIPELINE_ID_OBJECT_OR_EMAIL); //first try to find using _id, if it returns empty array, then try by email
        } else {
          users = await db.get(COLLECTION, { email: id.toLowerCase() }); //use objectid to get id from mongodb
        }
        if (users.length == 0) {
          error = "User not Found!";
          return { error: error };
        }
        // console.log("Compare Key and HashKey, result is: " await userHashKey.compare("123456", users[0].key));  //to check hashKey
      }
      return { result: users };
    } catch (error) {
      return { error: error };
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////
  ////Add new users individually "{POST} /users"///////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  const add = async (name, email, key, phone, address, city) => {
    console.log(" --- usersModel.add --- ");
    try {
      //check if email was already registered
      email = email.toLowerCase();
      const users = await db.get(COLLECTION, { email: email }); //use objectid to get id from mongodb

      if (users.length > 0) {
        error = "Email (" + email + ") is already being Used.";
        return { error: error };
      }
      let hashKey = await userHashKey.hash(key); // call a function to hash the user key
      const results = await db.add(COLLECTION, {
        name: name,
        email: email.toLowerCase(),
        phone: phone,
        userType: "user",
        address: address,
        city: city,
        key: hashKey,
      });

      return { result: results.ops };
    } catch (error) {
      return { error: error };
    }
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete user "{DELETE} /users/{email}"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteUser = async (id) => {
    console.log(" --- usersModel.delete --- ");

    // load the active user email who is logged in.
    const userEmail = auth.currentUser.userEmail;
    const userType = auth.currentUser.userType;
    try {
      if (userType !== "admin") {
        id = userEmail;
      }
      id = id.toLowerCase();
      let results = null;
      let collection = null;
      collection = await db.get(COLLECTION, { email: id });
      if (!collection[0]) {
        error = "User (" + id + ") NOT FOUND!";
        return { error: error };
      } else if (collection[0].userType == "user") {
        //results = await db.deleteOne(COLLECTION, { email: id });

        const router = Router();
      }

      console.log("User " + id + " DELETED");
      return { result: results };
    } catch (error) {
      return { error: error };
    }
  };

  return {
    get,
    add,
    deleteUser,
  };
};
