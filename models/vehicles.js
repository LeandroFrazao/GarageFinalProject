const db = require("../db")();
const COLLECTION = "vehicles";
const auth = require("../user/auth");
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
          console.log(id);
          //check if object is valid
          PIPELINE_ID_OBJECT_OR_VIN = {
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
  ////Get all vehicles from user "{GET} /vehicles/{email}"///////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  const getVehiclesByUser = async (email) => {
    console.log(" --- vehiclesModel.getIssuesByProject --- ");
    try {
      email = email.toLowerCase();
      const PIPELINE_EMAIL_VEHICLES = [
        {
          $lookup: {
            from: "vehicles",
            localField: "email",
            foreignField: "email",
            as: "user",
          },
        },
        { $match: { email: email } },
      ];

      const vehicles = await db.aggregate("vehicles", PIPELINE_EMAIL_VEHICLES);
      if (!vehicles[0]) {
        error = "Email (" + email + ") NOT FOUND!";
        return { error: error };
      }
      if (vehicles[0].issue.length == 0) {
        error = "vehicles for email (" + slug + ") NOT FOUND!";
        return { error: error };
      }
      return { result: vehicles };
    } catch (error) {
      return { error: error };
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new vehicles to user individually "{POST} /vehicle"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const add = async (vin, type, make, model, engine, year) => {
    console.log(" --- vehiclesModel.add --- ");

    try {
      const authorEmail = auth.currentUser.userEmail; //whoever is logged is going to record automatically the email of the current user
      vin = vin.toUpperCase();
      let project = null;
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

  return {
    get,
    getVehiclesByUser,
    add,
  };
};
