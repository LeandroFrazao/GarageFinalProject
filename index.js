//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\                                                                        \\\\\\\\\\\\\\\\\\\
//\\                                                                        \\\\\\\\\\\\\\\\\\\
//\\     FINAL PROJECT CCT                                                  \\\\\\\\\\\\\\\\\\\
//\\     GER'S GARAGE                                                       \\\\\\\\\\\\\\\\\\\
//\\                                                                        \\\\\\\\\\\\\\\\\\\
//\\     Student: Leandro Frazão                                            \\\\\\\\\\\\\\\\\\\
//\\     Studend Number: 2020094                                            \\\\\\\\\\\\\\\\\\\
//\\                                                                        \\\\\\\\\\\\\\\\\\\
//\\                                                          December,2020 \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const express = require("express");

const bodyParser = require("body-parser");

const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;

const usersController = require("./controller/users")();
const vehiclesController = require("./controller/vehicles")();
const serviceController = require("./controller/service")();
const invoiceController = require("./controller/invoice")();
const partsController = require("./controller/parts")();

const cookieParser = require("cookie-parser");
const app = express();

//login
app.use((req, res, next) => {
  console.log("[%s] %s -- %s", new Date(), "Method: ", req.method, req.url);
  next();
});
const { login, logout } = require("./userlogin/login");
//const { accessLevel } = require("./user/auth");
const { register, confirmation } = require("./userlogin/register");

//variables are loaded with validator to be used on the routes.
const { validateLogin, validateUser } = require("./userlogin/validator");
app.use(cookieParser());
app.use(bodyParser.json());

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\                       AUTHENTICATION                                   \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const { auth, accessLevel } = require("./userlogin/auth");

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\     In Postman(or similar)                                           \\\\\\\\\\\\\\\\\\\
//\\     Request: {POST}"/login"                                          \\\\\\\\\\\\\\\\\\\
//\\     Body:                                                            \\\\\\\\\\\\\\\\\\\
//\\ USER-->   "email": "your email"                                      \\\\\\\\\\\\\\\\\\\
//\\ KEY-->    "key": "your password"                                     \\\\\\\\\\\\\\\\\\\
//\\                                                                      \\\\\\\\\\\\\\\\\\\
//\\    For demonstration/test purpose:                                   \\\\\\\\\\\\\\\\\\\
//\\  {  "email": "user@gmail.com"                                        \\\\\\\\\\\\\\\\\\\
//\\    "key": "123456"   }                                               \\\\\\\\\\\\\\\\\\\
//\\                       (all users were registered with same password) \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\                       LOGIN                                            \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
app.post("/login", validateLogin, login);
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\                       Register NEW USER                                \\\\\\\\\\\\\\\\\\\
//\\                       /register                                        \\\\\\\\\\\\\\\\\\\
//\\                                                                        \\\\\\\\\\\\\\\\\\\
//\\                       Confirmation NEW USER                            \\\\\\\\\\\\\\\\\\\
//\\                       /verify/ {token sent by email}                   \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
app.post("/register", validateUser, register);
app.get("/verify/:randomtoken", confirmation);

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\                       ROUTES                                           \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//////////////////////////////////////////////////////////////////////////////////
/////         USERS                                              ////////////////
////////////////////////////////////////////////////////////////////////////////
//------------> get all users
app.get("/users", auth, accessLevel, usersController.getController);
//------------> add an user
app.post(
  "/users",
  auth,
  accessLevel,
  validateUser,
  usersController.postController
);
//------------> get a user by email or user _id
app.get("/users/:id", auth, accessLevel, usersController.getById);
//------------> delete
app.delete("/users/:email", auth, usersController.deleteController);

//////////////////////////////////////////////////////////////////////////////////
/////         vehicles                                           ////////////////
////////////////////////////////////////////////////////////////////////////////
//------------> get all users
app.get("/vehicles", auth, vehiclesController.getController);
//------------> add an user
app.post("/vehicles", auth, validateUser, vehiclesController.postController);
//------------> get a user by VIN
app.get("/vehicles/:id", auth, vehiclesController.getByIdController);
//------------> get a user by email or user _id
app.get(
  "/users/:email/vehicles",
  auth,
  vehiclesController.getVehicleByEmailController
);
//------------> delete
app.delete("/vehicles/:vin", auth, vehiclesController.deleteController);

//////////////////////////////////////////////////////////////////////////////////
/////         service                                            ////////////////
////////////////////////////////////////////////////////////////////////////////
//------------> get all services
app.get("/service", auth, serviceController.getController);
//------------> add an service
app.post("/service", auth, validateUser, serviceController.postController);
//------------> get a service by serviceId
app.get("/service/:id", auth, serviceController.getByIdController);
//------------> change status of service
app.put(
  "/service/:serviceId/:status",
  auth,
  serviceController.putUpdateStatusController
);
//------------> delete
app.delete("/service/:serviceId", auth, serviceController.deleteController);

//////////////////////////////////////////////////////////////////////////////////
/////         invoice                                            ////////////////
////////////////////////////////////////////////////////////////////////////////
//------------> get all invoices
app.get("/invoice", auth, invoiceController.getController);
//------------> add an invoice
app.post("/invoice", auth, validateUser, invoiceController.postController);
//------------> get an invoice by invoiceId
app.get("/invoice/:id", auth, invoiceController.getByIdController);
//------------> add items
app.post("/invoice/:invoiceId", auth, invoiceController.postItemController);
//------------> delete items
app.delete(
  "/invoice/:invoiceId/:itemId",
  auth,
  invoiceController.deleteItemController
);
//------------> delete
app.delete("/invoice/:invoiceId", auth, invoiceController.deleteController);

//////////////////////////////////////////////////////////////////////////////////
/////         parts                                              ////////////////
////////////////////////////////////////////////////////////////////////////////
//------------> get all parts
app.get("/parts", auth, partsController.getController);
//------------> add a part
app.post("/parts", auth, validateUser, partsController.postController);
//------------> get a part by slug
app.get("/parts/:id", auth, partsController.getByIdController);
//------------> delete
app.delete("/parts/:slug", auth, partsController.deleteController);

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  //console.log(process.env.MONGO_URI)
});

//////////////////////////////////////////////////////////////////////////////////
/////        logout                                              ////////////////
////////////////////////////////////////////////////////////////////////////////
app.post("/logout", auth, logout);

app.use((req, res) => {
  res.status(404).json({
    error: 404,
    message: "Route not found",
  });
});
