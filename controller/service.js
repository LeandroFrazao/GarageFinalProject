const vehicles = require("../models/vehicles")();

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all services "{GET} /services"///////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  const getController = async (req, res) => {
    const { result, error } = await vehicles.get();
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ vehicles: result });
  };

  ////////////////////////////////////////////////////////////////////////////////
  ////Get individual services "{GET} /services/{:VIN}" or {_id}//////////////
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
    const slug = req.params.slug;
    const { result, error } = await vehicles.getVehiclesByUser(slug);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ vehicles: result });
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new vehicles to an user individually "{POST} /vehicle"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const postController = async (req, res) => {
    const slug = req.params.slug;
    const title = req.body.title;
    const description = req.body.description;
    const status = req.body.status;
    const dueDate = req.body.dueDate;
    const { result, error } = await vehicles.add(
      slug,
      title,
      description,
      status,
      dueDate
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
