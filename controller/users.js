module.exports = () => {
  const users = require("../models/users")();

  ///////////////////////////////////////////////////////////////////////////
  /////Get all users "{GET} /users"/////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////

  const getController = async (req, res) => {
    const { result, error } = await users.get();
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ users: result });
  };
  /////////////////////////////////////////////////////////////////////////
  /////Get individual users "{GET} /users/{EMAIL}" or { _id}//////////////
  ///////////////////////////////////////////////////////////////////////
  const getById = async (req, res) => {
    const { result, error } = await users.get(req.params.id);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ users: result });
  };

  //////////////////////////////////////////////////////////////////////////////////////
  ////Add new users individually "{POST} /users"///////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  const postController = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const key = req.body.key;
    const phone = req.body.phone;
    const address = req.body.address;
    const city = req.body.city;
    const { result, error } = await users.add(
      name,
      email,
      key,
      phone,
      address,
      city
    );
    if (error) {
      return res.status(500).json({ error });
    }

    res.json({ users: result });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete user "{DELETE} /users/{email}"                                                      ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteController = async (req, res) => {
    const id = req.params.email;
    const { result, error } = await users.deleteUser(id);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ results: result });
  };

  return {
    getController,
    postController,
    getById,
    deleteController,
  };
};
