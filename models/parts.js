const db = require("../db")();
const COLLECTION = "parts";
const ObjectID = require("mongodb").ObjectID;

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all parts "{GET} /parts"///////////////////////////////////////////////
  ////Or                                    //////////////////////////////////////
  ////Get individual part "{GET} /parts/{:slug}" or {_id}//////////////
  //////////////////////////////////////////////////////////////////////////////
  const get = async (id = null) => {
    // find document or using slug or _id
    console.log(" --- partsModel.get --- ");
    let parts = null;
    try {
      if (!id) {
        parts = await db.get(COLLECTION);
        if (!parts[0]) {
          error = "There are no parts Registered";
          return { error: error };
        }
      } else {
        // if user use service _id ,
        const slug = id.toUpperCase();
        if (ObjectID.isValid(id)) {
          console.log(id);
          //check if object is valid
          PIPELINE_ID_OBJECT_OR_SLUG = {
            //if objectID(id) is valid, so the query is going to try to find BOTH _id or slug
            $or: [{ _id: ObjectID(id) }, { slug: slug }],
          };
          parts = await db.get(COLLECTION, PIPELINE_ID_OBJECT_OR_SLUG);
        } else {
          //or use query to find VIN from mongodb
          parts = await db.get(COLLECTION, { slug: slug });
        }
        if (!parts[0]) {
          // if query returns undefined means that there's no parts registered
          error = "There is no parts (" + id + ") Registered";
          return { error: error };
        }
      }

      return { result: parts };
    } catch (error) {
      return { error: error };
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new parts  "{POST} /parts"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const add = async (name, cost, category, make, model) => {
    console.log(" --- partsModel.add --- ");

    try {
      let slug = category.substr(0, 4) + make.substr(0, 4) + "-" + model;
      slug = slug.toUpperCase();
      //check if serviceId was already registered
      const parts = await db.get(COLLECTION, { slug: slug });

      if (parts.length > 0) {
        error = "Part (" + slug + ") is already registered.";
        return { error: error };
      }

      const results = await db.add(COLLECTION, {
        slug: slug,
        partName: name,
        cost: cost,
        make: make,
        model: model,
        category: category,
      });
      return { result: results.result };
    } catch (error) {
      return { error: error };
    }
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Updated  part "{PUT} /parts/{slug}"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const putUpdatePart = async ({
    slug: slug,
    partName: partName,
    cost: cost,
    category: category,
    make: make,
    model: model,
  }) => {
    console.log(" --- partsModel.putUpdateCost --- ");
    try {
      let newSlug = category.substr(0, 4) + make.substr(0, 4) + "-" + model;
      newSlug = newSlug.toUpperCase();

      let part = null;
      part = await db.get(COLLECTION, { slug: slug });
      if (!part[0]) {
        error = "Part (" + slug + ") NOT FOUND!";
        return { error: error };
      }
      const newValue = {
        $set: {
          slug: newSlug,
          cost: cost,
          partName: partName,
          cost: cost,
          make: make,
          model: model,
          category: category,
        },
      };
      const parts = await db.update(COLLECTION, { slug }, newValue);
      return { result: parts };
    } catch (error) {
      return { error: error };
    }
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete part "{DELETE} /parts/{slug}"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deletePart = async (slug) => {
    console.log(" --- partsModel.delete --- ");
    try {
      slug = slug.toUpperCase();

      let part = null;
      part = await db.get(COLLECTION, { slug: slug });
      if (!part[0]) {
        error = "Part (" + slug + ") NOT FOUND!";
        return { error: error };
      }
      const parts = await db.deleteOne(COLLECTION, { slug: slug });
      console.log("Part " + slug + " DELETED");
      return { result: parts };
    } catch (error) {
      return { error: error };
    }
  };

  return {
    get,
    add,
    putUpdatePart,
    deletePart,
  };
};
