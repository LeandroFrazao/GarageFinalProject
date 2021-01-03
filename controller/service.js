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

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new service to an user individually "{POST} /services"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const postController = async (req, res) => {
    const vin = req.body.vin;
    const status = req.body.status;
    const description = req.body.description;
    const staff = req.body.staff;
    const service = req.body.service;
    const { result, error } = await services.add(
      vin,
      status,
      description,
      staff,
      service
    );
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
  ////Delete service "{DELETE} /service/{serviceId}"                                                      ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteController = async (req, res) => {
    const id = req.params.serviceId;
    const { result, error } = await services.deleteService(id);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ results: result });
  };

  return {
    getController,
    getByIdController,
    postController,
    putUpdateStatusController,
    deleteController,
  };
};