const parts = require("../models/parts")();

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all parts "{GET} /parts"///////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  const getController = async (req, res) => {
    const { result, error } = await parts.get();
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ parts: result });
  };

  ////////////////////////////////////////////////////////////////////////////////
  ////Get individual part "{GET} /parts/{:slug}" or {_id}//////////////
  //////////////////////////////////////////////////////////////////////////////
  const getByIdController = async (req, res) => {
    const { result, error } = await parts.get(req.params.id);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ parts: result });
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new parts  "{POST} /services"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const postController = async (req, res) => {
    const name = req.body.partName;
    const cost = req.body.cost;
    const category = req.body.category;
    const make = req.body.make;
    const model = req.body.model;
    const { result, error } = await parts.add(
      name,
      cost,
      category,
      make,
      model
    );
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ parts: result });
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Updated the cost of a part "{PUT} /parts/{slug}"                                                 ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const putUpdatePartController = async (req, res) => {
    const slug = req.params.slug;
    const cost = req.body.cost;
    const partName = req.body.partName;
    const category = req.body.category;
    const make = req.body.make;
    const model = req.body.model;
    const { result, error } = await parts.putUpdatePart({
      slug: slug,
      partName: partName,
      cost: cost,
      category: category,
      make: make,
      model: model,
    });
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ parts: result });
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete part "{DELETE} /parts/{slug}"                                                                ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteController = async (req, res) => {
    const slug = req.params.slug;
    const { result, error } = await parts.deletePart(slug);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ parts: result });
  };

  return {
    getController,
    getByIdController,
    postController,
    putUpdatePartController,
    deleteController,
  };
};
