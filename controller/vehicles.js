const vehicles = require("../models/vehicles")();

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all vehicles "{GET} /vehicles"///////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  const getController = async (req, res) => {
    const { result, error } = await vehicles.get();
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ vehicles: result });
  };

  ////////////////////////////////////////////////////////////////////////////////
  ////Get individual vehicles "{GET} /vehicles/{:VIN}" or {_id}//////////////
  //////////////////////////////////////////////////////////////////////////////
  const getByIdController = async (req, res) => {
    const { result, error } = await vehicles.get(req.params.id);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ vehicles: result });
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////
  ////Get all vehicles for an user "{GET} /users/{email}/vehicles"///////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  const getVehicleByEmailController = async (req, res) => {
    const email = req.params.email;
    const { result, error } = await vehicles.getVehiclesByUser(email);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ users: result });
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new vehicles to an user individually "{POST} /vehicle"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const postController = async (req, res) => {
    const vin = req.body.vin;
    const model = req.body.model;
    const type = req.body.type;
    const make = req.body.make;
    const engine = req.body.engine;
    const year = req.body.year;
    const { result, error } = await vehicles.add({
      vin: vin,
      model: model,
      type: type,
      make: make,
      engine: engine,
      year: year,
    });
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ vehicles: result });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete vehicle "{DELETE} /vehicles/{vin}"                                                      ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteController = async (req, res) => {
    const id = req.params.vin;
    const { result, error } = await vehicles.deleteVehicle(id);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ results: result });
  };

  return {
    getController,
    getByIdController,
    getVehicleByEmailController,
    postController,
    deleteController,
  };
};
