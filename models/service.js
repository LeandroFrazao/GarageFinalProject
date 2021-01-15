const db = require("../db")();
const COLLECTION = "service";
const auth = require("../userlogin/auth");
const ObjectID = require("mongodb").ObjectID;

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all services "{GET} /service"///////////////////////////////////////////////
  ////Or                                    //////////////////////////////////////
  ////Get individual service "{GET} /service/{:vin}" or {_id}//////////////
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

  ///////////////////////////////////////////////////////////////////////////////////////////////
  ////Get all services from user "{GET} /users/{email}/service/"///////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  const getServicesByUser = async (email) => {
    console.log(" --- servicesModel.getServiceByUser --- ");
    try {
      // load the user's email and the type of user who is logged in.
      let userEmail = auth.currentUser.userEmail;
      let userType = auth.currentUser.userType;

      email = email.toLowerCase();
      //if userType is not admin, it's not possible to see other user accounts.
      if (userType !== "admin") {
        email = userEmail;
      }

      const PIPELINE_EMAIL_SERVICES = [
        {
          $lookup: {
            from: "service",
            localField: "email",
            foreignField: "email",
            as: "services",
          },
        },
        { $match: { email: email } },
      ];

      const users = await db.aggregate("users", PIPELINE_EMAIL_SERVICES);
      console.log(users[0]);
      if (!users[0]) {
        error = "Email (" + email + ") NOT FOUND!";
        return { error: error };
      }
      if (users[0].services.length == 0) {
        error = "Services for email (" + email + ") NOT FOUND!";
        return { error: error };
      }
      return { result: users };
    } catch (error) {
      return { error: error };
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new services to user individually "{POST} /services"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const add = async (vin, status, description, serviceType, date_in) => {
    console.log(" --- servicesModel.add --- ");
    try {
      // load the user's email and the type of user who is logged in.
      let userEmail = auth.currentUser.userEmail;

      vin = vin.toUpperCase();
      const date = new Date();
      /* const date_in =
        date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        let serviceId =
        vin + "_" + date.getDate() + (date.getMonth() + 1) + date.getFullYear(); 
     */

      /////////////////////generate serviceId
      let serviceId = vin + "_" + date_in;

      //check if serviceId was already registered
      const services = await db.get(COLLECTION, { serviceId: serviceId });

      if (services.length > 0) {
        error = "Service (" + serviceId + ") is already registered.";
        return { error: error };
      }

      const results = await db.add(COLLECTION, {
        email: userEmail,
        serviceId: serviceId,
        vin: vin,
        status: status,
        description: description,
        staff: "",
        serviceType: serviceType,
        date_in: date_in,
      });
      return { result: results.result };
    } catch (error) {
      return { error: error };
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Updated service for user "{PUT} /users/{email}/service/{serviceId}/"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const putUpdateService = async ({
    serviceId,
    vin,
    status,
    description,
    serviceType,
    date_in,
  }) => {
    console.log(" --- serviceModel.putUpdateStatus --- ");
    try {
      serviceId = serviceId.toUpperCase();

      // load the user's email and the type of user who is logged in.
      let userEmail = auth.currentUser.userEmail;
      let userType = auth.currentUser.userType;

      email = email.toLowerCase();
      //if userType is not admin, it's not possible to see other user accounts.
      if (userType !== "admin") {
        email = userEmail;
      }
      const PIPELINE_EMAIL_SERVICES = [
        { $match: { email: email } },
        {
          $lookup: {
            from: "services",
            localField: "email",
            foreignField: "email",
            as: "service",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            vehicle: {
              $filter: {
                input: "$service",
                as: "service",
                cond: { $eq: ["$$service.serviceId", serviceId] },
              },
            },
          },
        },
      ];

      const collection = await db.aggregate("users", PIPELINE_EMAIL_SERVICES);

      console.log(collection);

      let service = null;
      service = await db.get(COLLECTION, { serviceId: serviceId });
      if (!service[0]) {
        error = "Service ID (" + serviceId + ") NOT FOUND!";
        return { error: error };
      }

      const newValue = {
        $set: {
          serviceId: serviceId,
          vin: vin,
          status: status,
          description: description,
          staff: staff,
          serviceType: serviceType,
          date_in: date_in,
        },
      };
      const services = await db.update(COLLECTION, { serviceId }, newValue);
      return { result: services };
    } catch (error) {
      return { error: error };
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Updated the status of a service "{PUT} /service/{serviceId}/{STATUS}"  ///(admin)
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const putUpdateStatus = async ({ serviceId, status, staff }) => {
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
  ////Delete service "{DELETE} /users/{email}/service/{serviceId}"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteService = async ({ serviceId, email }) => {
    console.log(" --- serviceModel.delete --- ");
    try {
      serviceId = serviceId.toUpperCase();

      let collection = null;
      collection = await db.get(COLLECTION, { serviceId: serviceId });
      if (!collection[0]) {
        error = "Service (" + serviceId + ") NOT FOUND!";
        return { error: error };
      }
      const results = await db.deleteOne(COLLECTION, { serviceId: serviceId });
      console.log("Service " + serviceId + " DELETED");
      return { result: results };
    } catch (error) {
      return { error: error };
    }
  };

  return {
    get,
    getServicesByUser,
    add,
    putUpdateStatus,
    putUpdateService,
    deleteService,
  };
};
