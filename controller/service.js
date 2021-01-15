const services = require("../models/service")();

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all services "{GET} /services"///////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  const getController = async (req, res) => {
    const { result, error } = await services.get();
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ services: result });
  };

  ////////////////////////////////////////////////////////////////////////////////
  ////Get individual services "{GET} /services/{:VIN}" or {_id}//////////////
  //////////////////////////////////////////////////////////////////////////////
  const getByIdController = async (req, res) => {
    const { result, error } = await services.get(req.params.id);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ services: result });
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////
  ////Get all services for an user "{GET} /users/{email}/service"///////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  const getServiceByEmailController = async (req, res) => {
    const email = req.params.email;
    const { result, error } = await services.getServicesByUser(email);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ users: result });
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new service to an user individually "{POST} /services"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const postController = async (req, res) => {
    const vin = req.body.vin;
    const status = req.body.status;
    const description = req.body.description;
    const staff = req.body.staff;
    const serviceType = req.body.serviceType;
    const { result, error } = await services.add(
      vin,
      status,
      description,
      staff,
      serviceType
    );
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ services: result });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Updated service for user "{PUT} /users/{email}/service/{serviceId}                          ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const putUpdateServiceController = async (req, res) => {
    const serviceId = req.params.serviceId;
    const email = req.params.email;
    const vin = req.body.vin;
    const status = req.body.status;
    const description = req.body.description;
    const serviceType = req.body.serviceType;

    const { result, error } = await services.putUpdateService({
      serviceId: serviceId,
      email: email,
      vin: vin,
      status: status,
      description: description,
      serviceType: serviceType,
    });
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ services: result });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Updated the status of a service "{PUT} /service/{serviceId}/{STATUS}"                          ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const putUpdateStatusController = async (req, res) => {
    const serviceId = req.params.serviceId;
    const status = req.params.status;
    const { result, error } = await services.putUpdateStatus(serviceId, status);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ services: result });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete service "{DELETE} /users/{email}/service/{serviceId}"                                                      ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteController = async (req, res) => {
    const serviceId = req.params.serviceId;
    const email = req.params.email;
    const { result, error } = await services.deleteService({
      serviceId: serviceId,
      email: email,
    });
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ results: result });
  };

  return {
    getController,
    getByIdController,
    getServiceByEmailController,
    postController,
    putUpdateServiceController,
    putUpdateStatusController,
    deleteController,
  };
};
