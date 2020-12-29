const invoices = require("../models/invoice")();

module.exports = () => {
  //////////////////////////////////////////////////////////////////////////////////
  ////Get all vehicles "{GET} /vehicles"///////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  const getController = async (req, res) => {
    const { result, error } = await invoices.get();
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ invoices: result });
  };

  ////////////////////////////////////////////////////////////////////////////////
  ////Get individual invoice "{GET} /invoice/{:VIN}" or {_id}//////////////
  //////////////////////////////////////////////////////////////////////////////
  const getByIdController = async (req, res) => {
    const { result, error } = await invoices.get(req.params.id);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ invoices: result });
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////
  ////Get all invoices for an user "{GET} /invoice/{email}"///////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////
  const getInvoiceByEmailController = async (req, res) => {
    const email = req.params.email;
    const { result, error } = await invoices.getInvoicesByUser(email);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ invoices: result });
  };

  //////////////////////////////////////////////////////////////////////////////////////////
  /////Add new invoices to an user individually "{POST} /invoice"////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  const postController = async (req, res) => {
    const serviceId = req.body.serviceId;
    const { result, error } = await invoices.add(serviceId);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ invoices: result });
  };

  ///////////////////////////////////////////////////////////////////////////////////////
  /////Add new items to invoice "{POST} /invoice/{invoiceId}"////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  const postItemController = async (req, res) => {
    const invoiceId = req.params.invoiceId;
    const slug = req.body.slug;
    const quantity = req.body.quantity;
    const { result, error } = await invoices.addItem(invoiceId, slug, quantity);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ invoices: result });
  };
  ///////////////////////////////////////////////////////////////////////////////////////
  /////Delete item of invoice "{DELETE} /invoice/{invoiceId}/{itemId}"////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  const deleteItemController = async (req, res) => {
    const invoiceId = req.params.invoiceId;
    const itemId = req.params.itemId;
    const { result, error } = await invoices.deleteItem(invoiceId, itemId);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ invoices: result });
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////Delete invoice "{DELETE} /invoice/{invoiceId}"                                                      ///
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const deleteController = async (req, res) => {
    const id = req.params.invoiceId;
    const { result, error } = await invoices.deleteInvoice(id);
    if (error) {
      return res.status(500).json({ error });
    }
    res.json({ results: result });
  };

  return {
    getController,
    getByIdController,
    getInvoiceByEmailController,
    postController,
    postItemController,
    deleteItemController,
    deleteController,
  };
};
