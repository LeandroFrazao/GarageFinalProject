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
        { $match: { email: email } },
        {
          $lookup: {
            from: "service",
            localField: "email",
            foreignField: "email",
            as: "services",
          },
        },
      ];

      const users = await db.aggregate("users", PIPELINE_EMAIL_SERVICES);

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

  ///////////////////////////////////////////////////////////////////////////////////////////////
  ////Group bookings  and count them "{GET} /users/service/bookings "   ////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  const getBookings = async () => {
    console.log(" --- servicesModel.getBookings --- ");

    try {
      let currentDate = new Date().toISOString().substr(0, 10);
      //pipeline to get results from the current date, then group serviceType by date, and each serviceType is counted, but for major repairs, it is counted by 2.
      const PIPELINE_GROUP_ALL_BOOKINGS = [
        {
          $match: {
            date_in: {
              $gte: currentDate,
            },
          },
        },
        {
          $group: {
            _id: { date_in: "$date_in", serviceType: "$serviceType" },
            count: {
              $sum: {
                $cond: [{ $eq: ["$serviceType", "Major Repair"] }, 2, 1],
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.date_in",
            services: {
              $push: {
                serviceType: "$_id.serviceType",
                countTypeService: "$count",
              },
            },
            count: { $sum: "$count" },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ];

      const bookings = await db.aggregate(
        COLLECTION,
        PIPELINE_GROUP_ALL_BOOKINGS
      );
      console.log(bookings[0]);
      if (!bookings[0]) {
        error = "NO BOOKINGS FOUND!";
        return { error: error };
      }

      return { result: bookings };
    } catch (error) {
      return { error: error };
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new services to user individually "{POST} /services"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const add = async ({ vin, status, description, serviceType, date_in }) => {
    console.log(" --- servicesModel.add --- ");
    try {
      // load the user's email and the type of user who is logged in.
      let userEmail = auth.currentUser.userEmail;
      vin = vin.toUpperCase();
      console.log(vin, status, description, serviceType, date_in);
      const PIPELINE_GROUP_BOOKINGS_BY_DATE = [
        { $match: { date_in: date_in } },
        {
          $group: {
            _id: { date_in: "$date_in", serviceType: "$serviceType" },
            count: {
              $sum: {
                $cond: [{ $eq: ["$serviceType", "Major Repair"] }, 2, 1],
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.date_in",
            services: {
              $push: {
                serviceType: "$_id.serviceType",
                countTypeService: "$count",
              },
            },
            count: { $sum: "$count" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 30 },
      ];

      const bookings = await db.aggregate(
        "service",
        PIPELINE_GROUP_BOOKINGS_BY_DATE
      );

      console.log(bookings[0] && bookings[0].count);
      if (bookings[0] && bookings[0].count > 3) {
        error = "No Booking available for this date (" + date_in + ")";
        return { error: error };
      } else if (
        bookings[0] &&
        bookings[0].count == 3 &&
        serviceType == "Major Repair"
      ) {
        error =
          "It's not possible to book Major Repair for this date (" +
          date_in +
          "). Pick another day.";
        return { error: error };
      }

      /////////////////////generate serviceId
      let serviceId = vin + "_" + date_in.replace(/-/g, "");

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
    email,
  }) => {
    console.log(" --- serviceModel.putUpdateService --- ");
    try {
      serviceId = serviceId.toUpperCase();

      let newServiceId = vin + date_in.replace(/-/g, "");
      // load the user's email and the type of user who is logged in.
      let userEmail = auth.currentUser.userEmail;
      let userType = auth.currentUser.userType;

      email = email.toLowerCase();
      //if userType is not admin, it's not possible to see other user accounts.
      if (userType !== "admin") {
        email = userEmail;
      }
      console.log(serviceId);
      const PIPELINE_USER_SERVICES = [
        { $match: { email: email } },
        {
          $lookup: {
            from: "service",
            localField: "email",
            foreignField: "email",
            as: "service",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            service: {
              $filter: {
                input: "$service",
                as: "service",
                cond: { $eq: ["$$service.serviceId", serviceId] },
              },
            },
          },
        },
      ];

      const collection = await db.aggregate("users", PIPELINE_USER_SERVICES);

      if (!collection[0]) {
        error = "User (" + email + ") NOT FOUND!";
        return { error: error };
      }
      if (!collection[0].service[0]) {
        error = "Service ID (" + serviceId + ") NOT FOUND!";
        return { error: error };
      }
      let service = null;
      service = await db.get(COLLECTION, {
        $or: [{ serviceId: serviceId }, { serviceId: newServiceId }],
      });

      if (!service[0]) {
        error = "Service (" + serviceId + ") NOT FOUND!";
        return { error: error };
      } else if (service.length > 1) {
        error = "Error: Service (" + newServiceId + ") is already Booked.";
        return { error: error };
      }

      //pipeline to return a specific date and its the count of bookins.
      const PIPELINE_GROUP_BOOKINGS_BY_DATE = [
        { $match: { date_in: date_in } },
        {
          $group: {
            _id: { date_in: "$date_in", serviceType: "$serviceType" },
            count: {
              $sum: {
                $cond: [{ $eq: ["$serviceType", "Major Repair"] }, 2, 1],
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.date_in",
            services: {
              $push: {
                serviceType: "$_id.serviceType",
                countTypeService: "$count",
              },
            },
            count: { $sum: "$count" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 30 },
      ];

      const bookings = await db.aggregate(
        COLLECTION,
        PIPELINE_GROUP_BOOKINGS_BY_DATE
      );
      console.log(bookings[0] && bookings[0].count);
      // check the number of bookings for a specific day, if it is over 4.
      if (
        bookings[0] &&
        bookings[0].count > 3 &&
        date_in !== collection[0].service[0].date_in
      ) {
        error = "No Booking available for this date (" + date_in + ")";
        return { error: error };
      } else if (
        bookings[0] &&
        bookings[0].count == 3 &&
        serviceId != newServiceId &&
        serviceType == "Major Repair"
      ) {
        error =
          "It's not possible to book Major Repair for this date (" +
          date_in +
          "). Pick another day.";
        return { error: error };
      }

      const newValue = {
        $set: {
          serviceId: newServiceId,
          vin: vin,
          status: status,
          description: description,

          serviceType: serviceType,
          date_in: date_in,
        },
      };
      let id = collection[0].service[0]._id;

      const services = await db.update(
        COLLECTION,
        { _id: ObjectID(id) },
        newValue
      );
      return { result: services };
    } catch (error) {
      return { error: error };
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Updated the status of a service "{PUT} /users/{email}/service/{serviceId}/{STATUS}"  ///(admin)
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const putUpdateStatus = async ({ serviceId, status, staff, email }) => {
    console.log(" --- serviceModel.putUpdateStatus --- ");
    try {
      serviceId = serviceId.toUpperCase();

      email = email.toLowerCase();

      const PIPELINE_USER_SERVICES = [
        { $match: { email: email } },
        {
          $lookup: {
            from: "service",
            localField: "email",
            foreignField: "email",
            as: "service",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            service: {
              $filter: {
                input: "$service",
                as: "service",
                cond: { $eq: ["$$service.serviceId", serviceId] },
              },
            },
          },
        },
      ];

      const collection = await db.aggregate("users", PIPELINE_USER_SERVICES);
      if (!collection[0].service[0]) {
        error = "Service ID (" + serviceId + ") NOT FOUND!";
        return { error: error };
      }

      let service = null;
      service = await db.get(COLLECTION, {
        serviceId: serviceId,
      });

      if (!service[0]) {
        error = "Service (" + serviceId + ") NOT FOUND!";
        return { error: error };
      } else if (service.length > 1) {
        error = "Error: Service (" + newServiceId + ") is already Booked.";
        return { error: error };
      }

      const newValue = {
        $set: {
          status: status,
          staff: staff,
        },
      };
      let id = collection[0].service[0]._id;

      const services = await db.update(
        COLLECTION,
        { _id: ObjectID(id) },
        newValue
      );
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

      const PIPELINE_USER_SERVICES = [
        { $match: { email: email } },
        {
          $lookup: {
            from: "service",
            localField: "email",
            foreignField: "email",
            as: "service",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            service: {
              $filter: {
                input: "$service",
                as: "service",
                cond: { $eq: ["$$service.serviceId", serviceId] },
              },
            },
          },
        },
      ];

      const collection = await db.aggregate("users", PIPELINE_USER_SERVICES);
      if (!collection[0].service[0]) {
        error = "Service  (" + serviceId + ") NOT FOUND!";
        return { error: error };
      }

      let id = collection[0].service[0]._id;
      const results = await db.deleteOne(COLLECTION, { _id: ObjectID(id) });
      console.log("Service " + serviceId + " DELETED");
      return { result: results };
    } catch (error) {
      return { error: error };
    }
  };

  return {
    get,
    getServicesByUser,
    getBookings,
    add,
    putUpdateStatus,
    putUpdateService,
    deleteService,
  };
};
