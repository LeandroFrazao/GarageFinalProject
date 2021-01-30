const db = require("../db")();
const COLLECTION = "vehicles";
const auth = require("../userlogin/auth");
const ObjectID = require("mongodb").ObjectID;

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all vehicles "{GET} /vehicles"///////////////////////////////////////////////
  ////Or                                    //////////////////////////////////////
  ////Get individual vehicle "{GET} /vehicles/{:vin}" or {_id}//////////////
  //////////////////////////////////////////////////////////////////////////////
  const get = async (id = null) => {
    // find document or using VIN(vehicle id number) or _id
    console.log(" --- vehiclesModel.get --- ");
    let vehicles = null;
    try {
      if (!id) {
        vehicles = await db.get(COLLECTION);
        if (!vehicles[0]) {
          error = "There are no vehicles Registered";
          return { error: error };
        }
      } else {
        // if user use vehicle _id instead of vin,
        const vin = id.toUpperCase();
        if (ObjectID.isValid(id)) {
          //check if object is valid
          let PIPELINE_ID_OBJECT_OR_VIN = {
            //if objectID(id) is valid, so the query is going to try to find BOTH _id or VIN
            $or: [{ _id: ObjectID(id) }, { vin: vin }],
          };
          vehicles = await db.get(COLLECTION, PIPELINE_ID_OBJECT_OR_VIN);
        } else {
          //or use query to find VIN from mongodb
          vehicles = await db.get(COLLECTION, { vin: vin });
        }
        if (!vehicles[0]) {
          // if query returns undefined means that there's no vehicle registered
          error = "There is no vehicle (" + id + ") Registered";
          return { error: error };
        }
      }

      return { result: vehicles };
    } catch (error) {
      return { error: error };
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////
  ////Get all vehicles from logged user "{GET} /users/{:email}/vehicles/"///////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  const getVehiclesByUser = async (email) => {
    console.log(" --- vehiclesModel.getVehiclesByUser --- ");
    try {
      // load the user's email and the type of user who is logged in.
      let userEmail = auth.currentUser.userEmail;
      let userType = auth.currentUser.userType;

      email = email.toLowerCase();
      //if userType is not admin, it's not possible to see other user accounts.
      if (userType !== "admin") {
        email = userEmail;
      }

      const PIPELINE_EMAIL_VEHICLES = [
        { $match: { email: email } },
        {
          $lookup: {
            from: "vehicles",
            localField: "email",
            foreignField: "email",
            as: "vehicles",
          },
        },
      ];

      const users = await db.aggregate("users", PIPELINE_EMAIL_VEHICLES);
      //console.log(users[0]);
      if (!users[0]) {
        error = "Email (" + email + ") NOT FOUND!";
        return { error: error };
      }
      if (users[0].vehicles.length == 0) {
        error = "vehicles for email (" + email + ") NOT FOUND!";
        return { error: error };
      }
      return { result: users };
    } catch (error) {
      return { error: error };
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new vehicles to user individually "{POST} /vehicles"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const add = async ({ vin, type, make, model, engine, year }) => {
    console.log(" --- vehiclesModel.add --- ");

    try {
      const authorEmail = auth.currentUser.userEmail; //whoever is logged is going to record automatically the email of the current user

      vin = vin.toUpperCase();
      let vehicle = null;
      vehicle = await db.get("vehicles", { vin: vin });
      if (vehicle.length != 0) {
        if (vehicle[0].email == authorEmail) {
          error = "Vehicle (" + vin + ") already registered.";
          return { error: error };
        }
      }

      const results = await db.add(COLLECTION, {
        email: authorEmail,
        vin: vin,
        type: type,
        make: make,
        model: model,
        engine: engine,
        year: year,
      });

      return { result: results.result };
    } catch (error) {
      return { error: error };
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Update Vehicle "{PUT} /users/{email}/vehicle/{id}"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const putUpdateVehicle = async ({
    vin,
    type,
    make,
    model,
    engine,
    year,
    email,
    id,
  }) => {
    console.log(" --- vehicleModel.putUpdateVehicle --- ");
    try {
      vin = vin.toUpperCase();
      email = email.toLowerCase();
      // console.log(email, vin);
      // load the user's email and the type of user who is logged in.
      let userEmail = auth.currentUser.userEmail;
      let userType = auth.currentUser.userType;

      //if userType is not admin, it's not possible to see other user accounts.
      if (userType !== "admin") {
        email = userEmail;
      }
      //pipeline to aggregate a specific user email and vin
      const PIPELINE_EMAIL_VEHICLES = [
        { $match: { email: email } },
        {
          $lookup: {
            from: "vehicles",
            localField: "email",
            foreignField: "email",
            as: "vehicle",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            vehicle: {
              $filter: {
                input: "$vehicle",
                as: "vehicle",
                cond: { $eq: ["$$vehicle.vin", vin] },
              },
            },
          },
        },
      ];
      const collection = await db.aggregate("users", PIPELINE_EMAIL_VEHICLES);

      if (!collection[0]) {
        error = "User (" + email + ") NOT FOUND!";
        return { error: error };
      }
      let _id;
      console.log(id);

      console.log(collection[0].vehicle[0]);
      if (!collection[0].vehicle[0]) {
        //error = "Vehicle (" + vin + ") NOT FOUND!";
        //return { error: error };
        _id = id;
      } else if (collection[0].vehicle[0].vin == vin) {
        error = "Another Vehicle with same (" + vin + ") FOUND!";
        return { error: error };
      } else _id = collection[0].vehicle[0]._id;

      const newValue = {
        $set: {
          email: email,
          vin: vin,
          type: type,
          make: make,
          model: model,
          engine: engine,
          year: year,
        },
      };

      const result = await db.update(
        COLLECTION,
        { _id: ObjectID(_id) },
        newValue
      );

      return { result: result };
    } catch (error) {
      return { error: error };
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete vehicle "{DELETE} /users/{:email}/vehicles/"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteVehicle = async ({ email, vin }) => {
    console.log(" --- vehiclesModel.delete --- ");
    try {
      vin = vin.toUpperCase();
      email = email.toLowerCase();
      //console.log(email, vin);
      // load the user's email and the type of user who is logged in.
      let userEmail = auth.currentUser.userEmail;
      let userType = auth.currentUser.userType;

      //if userType is not admin, it's not possible to see other user accounts.
      if (userType !== "admin") {
        email = userEmail;
      }
      //pipeline to aggregate a specific user email and vin
      const PIPELINE_EMAIL_VEHICLES = [
        { $match: { email: email } },
        {
          $lookup: {
            from: "vehicles",
            localField: "email",
            foreignField: "email",
            as: "vehicle",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            vehicle: {
              $filter: {
                input: "$vehicle",
                as: "vehicle",
                cond: { $eq: ["$$vehicle.vin", vin] },
              },
            },
          },
        },
      ];
      const collection = await db.aggregate("users", PIPELINE_EMAIL_VEHICLES);

      if (!collection[0]) {
        error = "User (" + email + ") NOT FOUND!";
        return { error: error };
      }

      if (!collection[0].vehicle[0]) {
        error = "Vehicle (" + vin + ") NOT FOUND!";
        return { error: error };
      }
      const results = await db.deleteOne(COLLECTION, {
        _id: collection[0].vehicle[0]._id,
      });
      console.log("Vehicle " + vin + " DELETED");
      return { result: results };
    } catch (error) {
      return { error: error };
    }
  };

  return {
    get,
    getVehiclesByUser,
    add,
    putUpdateVehicle,
    deleteVehicle,
  };
};
