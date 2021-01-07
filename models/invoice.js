const db = require("../db")();
const COLLECTION = "invoice";
const auth = require("../userlogin/auth");
const ObjectID = require("mongodb").ObjectID;

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all invoices "{GET} /invoices"///////////////////////////////////////////////
  ////Or                                    //////////////////////////////////////
  ////Get individual invoice "{GET} /invoice/{:invoiceId}" or {_id}//////////////
  //////////////////////////////////////////////////////////////////////////////
  const get = async (id = null) => {
    // find document or using invoiceId or _id
    console.log(" --- invoicesModel.get --- ");
    let invoices = null;
    try {
      if (!id) {
        invoices = await db.get(COLLECTION);
        if (!invoices[0]) {
          error = "There are no invoice Registered";
          return { error: error };
        }
      } else {
        // if user use vehicle _id instead of vin,
        const invoiceId = id;
        if (ObjectID.isValid(id)) {
          console.log(id);
          //check if object is valid
          PIPELINE_ID_OBJECT_OR_INVOICEID = {
            //if objectID(id) is valid, so the query is going to try to find BOTH _id or invoiceId
            $or: [{ _id: ObjectID(id) }, { invoiceId: invoiceId }],
          };
          invoices = await db.get(COLLECTION, PIPELINE_ID_OBJECT_OR_INVOICEID);
        } else {
          //or use query to find VIN from mongodb
          invoices = await db.get(COLLECTION, { invoiceId: invoiceId });
        }
        if (!invoices[0]) {
          // if query returns undefined means that there's no vehicle registered
          error = "There is no invoice (" + invoiceId + ") Registered";
          return { error: error };
        }
      }

      return { result: invoices };
    } catch (error) {
      return { error: error };
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////
  ////Get all invoice from user "{GET} /invoices/{email}"///////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  const getInvoicesByUser = async (email) => {
    console.log(" --- invoicesModel.getIssuesByProject --- ");
    try {
      // load the user's email and the type of user who is logged in.
      let userEmail = auth.currentUser.userEmail;
      let userType = auth.currentUser.userType;

      email = email.toLowerCase();
      //if
      if (userType !== "admin") {
        email = userEmail;
      }

      const PIPELINE_EMAIL_INVOICES = [
        {
          $lookup: {
            from: "invoices",
            localField: "email",
            foreignField: "email",
            as: "users",
          },
        },
        { $match: { email: email } },
      ];

      const invoices = await db.aggregate("invoice", PIPELINE_EMAIL_INVOICES);
      if (!invoices[0]) {
        error = "Email (" + email + ") NOT FOUND!";
        return { error: error };
      }
      if (invoices[0].issue.length == 0) {
        error = "invoices for email (" + email + ") NOT FOUND!";
        return { error: error };
      }
      return { result: invoices };
    } catch (error) {
      return { error: error };
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new invoices to user individually "{POST} /invoice"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const add = async (serviceId) => {
    console.log(" --- invoicesModel.add --- ");

    try {
      const authorEmail = auth.currentUser.userEmail; //whoever is logged is going to record automatically the email of the current user
      serviceId = serviceId.toUpperCase();
      const date = new Date();
      const date_out =
        date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
      const count = await db.count(COLLECTION);
      const results = await db.add(COLLECTION, {
        invoiceId: count + 1,
        email: authorEmail,
        serviceId: serviceId,
        date_out: date_out,
        items: [],
      });
      return { result: results.result };
    } catch (error) {
      return { error: error };
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////
  /////Add new Items of invoice "{POST} /invoice/{invoiceId}"////////////////
  /////////////////////////////////////////////////////////////////////////////////
  const addItem = async (invoiceId, slug, quantity) => {
    console.log(" --- invoiceModel.addItem --- ");

    try {
      invoiceId = parseInt(invoiceId);
      const invoice = await db.get(COLLECTION, { invoiceId: invoiceId });
      if (invoice.length == 0) {
        error = "Invoice (" + invoiceId + ") NOT FOUND!";
        return { error: error };
      }
      let count = 0;
      const PIPELINE_LASTID_INVOICE_ITEMS = [
        { $match: { invoiceId: invoiceId } },
        {
          $project: {
            _id: 0,
            status: 1,
            item: { $arrayElemAt: ["$items", -1] },
          },
        },
      ];
      const lastId_items = await db.aggregate(
        COLLECTION,
        PIPELINE_LASTID_INVOICE_ITEMS
      );
      console.log(lastId_items);
      if (lastId_items[0]) {
        // if  was found the project, then count_comments is not undefined.
        count = lastId_items[0].item.itemId + 1;
      } else {
        error = "Invoice (" + invoiceId + ") NOT FOUND!";
        return { error: error };
      }

      const items = {
        itemId: count,
        slug: slug,
        quantity: quantity,
      };
      const results = await db.update(
        COLLECTION,
        { invoiceId: invoiceId },
        {
          $push: { items: items },
        }
      );
      return { result: results.result };
    } catch (error) {
      return { error: error };
    }
  };
  ///////////////////////////////////////////////////////////////////////////////////
  /////Delete Items of invoice "{DELETE} /invoice/{invoiceId}/{itemId}"////////////////
  /////////////////////////////////////////////////////////////////////////////////
  const deleteItem = async (invoiceId, itemId) => {
    console.log(" --- invoiceModel.DeleteItem --- ");

    try {
      itemId = parseInt(itemId);
      invoiceId = parseInt(invoiceId);
      const invoice = await db.get(COLLECTION, { invoiceId: invoiceId });
      console.log(invoice);
      if (invoice.length == 0) {
        error = "Invoice (" + invoiceId + ") NOT FOUND!";
        return { error: error };
      }
      const items = {
        itemId: itemId,
      };
      const results = await db.update(
        COLLECTION,
        { invoiceId: invoiceId },
        {
          $pull: { items: items },
        }
      );
      return { result: results.result };
    } catch (error) {
      return { error: error };
    }
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete invoice "{DELETE} /invoice/{invoiceId}"  ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteInvoice = async (id) => {
    console.log(" --- invoicesModel.delete --- ");
    try {
      id = id.toUpperCase();

      let collection = null;
      collection = await db.get(COLLECTION, { invoiceId: id });
      if (!collection[0]) {
        error = "Invoice (" + id + ") NOT FOUND!";
        return { error: error };
      }
      const results = await db.deleteOne(COLLECTION, { invoiceId: id });
      console.log("Invoice " + id + " DELETED");
      return { result: results };
    } catch (error) {
      return { error: error };
    }
  };

  return {
    get,
    getInvoicesByUser,
    add,
    addItem,
    deleteItem,
    deleteInvoice,
  };
};
