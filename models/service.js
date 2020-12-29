const db = require("../db")();
const COLLECTION = "service";
const auth = require("../userlogin/auth");
const ObjectID = require("mongodb").ObjectID;

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all services "{GET} /services"///////////////////////////////////////////////
  ////Or                                    //////////////////////////////////////
  ////Get individual service "{GET} /services/{:vin}" or {_id}//////////////
  //////////////////////////////////////////////////////////////////////////////
  const get = async (id = null) => {
    // find document or using serviceId or _id
    console.log(" --- servicesModel.get --- ");
    let services = null;
    try {
      if (!id) {
        services = await db.get(COLLECTION);
        if (!services[0]) {
          error = "There are no services Registered";
          return { error: error };
        }
      } else {
        // if user use service _id ,
        const serviceId = id.toUpperCase();
        if (ObjectID.isValid(id)) {
          console.log(id);
          //check if object is valid
          PIPELINE_ID_OBJECT_OR_SERVICEID = {
            //if objectID(id) is valid, so the query is going to try to find BOTH _id or VIN
            $or: [{ _id: ObjectID(id) }, { serviceId: serviceId }],
          };
          services = await db.get(COLLECTION, PIPELINE_ID_OBJECT_OR_SERVICEID);
        } else {
          //or use query to find VIN from mongodb
          services = await db.get(COLLECTION, { serviceId: serviceId });
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
      let serviceId =
        vin + "_" + date.getDate() + (date.getMonth() + 1) + date.getFullYear();

      //check if serviceId was already registered
      const services = await db.get(COLLECTION, { serviceId: serviceId });

      if (services.length > 0) {
        error = "Service (" + serviceId + ") is already registered.";
        return { error: error };
      }

      const results = await db.add(COLLECTION, {
        serviceId: serviceId,
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
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Updated the status of a service "{PUT} /service/{serviceId}/{STATUS}"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const putUpdateStatus = async (serviceId, status) => {
    console.log(" --- serviceModel.putUpdateStatus --- ");
    try {
      serviceId = serviceId.toUpperCase();

      let service = null;
      service = await db.get(COLLECTION, { serviceId: serviceId });
      if (!service[0]) {
        error = "Service ID (" + serviceId + ") NOT FOUND!";
        return { error: error };
      }

      const newValue = {
        $set: {
          status: status,
        },
      };
      const services = await db.update(COLLECTION, { serviceId }, newValue);
      return { result: services };
    } catch (error) {
      return { error: error };
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete service "{DELETE} /service/{serviceId}"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteService = async (id) => {
    console.log(" --- serviceModel.delete --- ");
    try {
      id = id.toUpperCase();

      let collection = null;
      collection = await db.get(COLLECTION, { serviceId: id });
      if (!collection[0]) {
        error = "Service (" + id + ") NOT FOUND!";
        return { error: error };
      }
      const results = await db.deleteOne(COLLECTION, { serviceId: id });
      console.log("Service " + id + " DELETED");
      return { result: results };
    } catch (error) {
      return { error: error };
    }
  };

  return {
    get,
    add,
    putUpdateStatus,
    deleteService,
  };
};
