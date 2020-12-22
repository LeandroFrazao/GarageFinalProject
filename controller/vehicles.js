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
  ////Get all issues for a project "{GET} /vehicles/{email}"///////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  const getVehicleByEmailController = async (req, res) => {
    const email = req.params.email;
    const { result, error } = await vehicles.getVehiclesByUser(email);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ vehicles: result });
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new vehicles to an user individually "{POST} /vehicle"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const postController = async (req, res) => {
    const vin = req.params.vin;
    const model = req.body.model;
    const type = req.body.type;
    const make = req.body.make;
    const engine = req.body.engine;
    const year = req.body.year;
    const { result, error } = await vehicles.add(
      vin,
      model,
      type,
      make,
      engine,
      year
    );
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ vehicles: result });
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////

  return {
    getController,
    getByIdController,
    getVehicleByEmailController,
    postController,
  };
};
