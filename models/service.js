const db = require("../db")();
const COLLECTION = "services";
const auth = require("../userlogin/auth");
const ObjectID = require("mongodb").ObjectID;

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all services "{GET} /services"///////////////////////////////////////////////
  ////Or                                    //////////////////////////////////////
  ////Get individual service "{GET} /services/{:vin}" or {_id}//////////////
  //////////////////////////////////////////////////////////////////////////////
  const get = async (id = null) => {
    // find document or using VIN(vehicle id number) or _id
    console.log(" --- servicesModel.get --- ");
    let vehicles = null;
    try {
      if (!id) {
        vehicles = await db.get(COLLECTION);
        if (!vehicles[0]) {
          error = "There are no services Registered";
          return { error: error };
        }
      } else {
        // if user use service _id instead of vin,
        const vin = id.toUpperCase();
        if (ObjectID.isValid(id)) {
          console.log(id);
          //check if object is valid
          PIPELINE_ID_OBJECT_OR_VIN = {
            //if objectID(id) is valid, so the query is going to try to find BOTH _id or VIN
            $or: [{ _id: ObjectID(id) }, { vin: vin }],
          };
          services = await db.get(COLLECTION, PIPELINE_ID_OBJECT_OR_VIN);
        } else {
          //or use query to find VIN from mongodb
          services = await db.get(COLLECTION, { vin: vin });
        }
        if (!services[0]) {
          // if query returns undefined means that there's no vehicle registered
          error = "There is no service (" + id + ") Registered";
          return { error: error };
        }
      }

      return { result: services };
    } catch (error) {
      return { error: error };
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new services to user individually "{POST} /services"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const add = async (vin, status, description, staff, service) => {
    console.log(" --- servicesModel.add --- ");

    try {
      vin = vin.toUpperCase();
      const date = new Date();
      const date_in =
        date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
      const results = await db.add(COLLECTION, {
        vin: vin,
        status: status,
        description: description,
        staff: staff,
        service: service,
        date_in: date_in,
      });
      return { result: results.result };
    } catch (error) {
      return { error: error };
    }
  };

  return {
    get,
    add,
  };
};
