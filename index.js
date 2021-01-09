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
const cors = require("cors");
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

app.use("/", express.static("static")); //call the index.html in static folder

///////////////////////////////////////
//////////login         //////////////
/////////////////////////////////////
app.use(cors());
app.use((req, res, next) => {
  console.log("[%s] %s -- %s", new Date(), "Method: ", req.method, req.url);
  next();
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Acces-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.header("Acces-Contorl-Allow-Methods", "Content-Type", "Authorization");

  next();
});

//app.use(express.json());   // TESTING
app.use(cookieParser());
app.use(bodyParser.json());
const { login, logout } = require("./userlogin/login");

const { register, confirmation } = require("./userlogin/register");

//variables are loaded with validator to be used on the routes.
const { validateLogin, validateUser } = require("./userlogin/validator");

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//\\                       AUTHENTICATION                                   \\\\\\\\\\\\\\\\\\\
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const { auth } = require("./userlogin/auth");
const { accessLevel } = require("./userlogin/accessLevel");

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
app.use(auth);
app.get("/users", accessLevel, usersController.getController);
//------------> add an user
app.post(
  "/users",

  accessLevel,
  validateUser,
  usersController.postController
);
//------------> get a user by email or user _id
app.get("/users/:id", usersController.getById);
//------------> delete
app.delete("/users/:email", usersController.deleteController);

//////////////////////////////////////////////////////////////////////////////////
/////         vehicles                                           ////////////////
////////////////////////////////////////////////////////////////////////////////
//------------> get all users
app.get("/vehicles", accessLevel, vehiclesController.getController);
//------------> add a vehicle
app.post("/vehicles", accessLevel, vehiclesController.postController);
//------------> get a user by VIN
app.get("/vehicles/:id", accessLevel, vehiclesController.getByIdController);
//------------> get a vehicle by email or user _id
app.get(
  "/users/:email/vehicles",

  vehiclesController.getVehicleByEmailController
);
//------------> delete
app.delete("/vehicles/:vin", vehiclesController.deleteController);

//////////////////////////////////////////////////////////////////////////////////
/////         service                                            ////////////////
////////////////////////////////////////////////////////////////////////////////
//------------> get all services
app.get("/service", serviceController.getController);
//------------> get a service by serviceId
app.get("/service/:id", serviceController.getByIdController);
//------------> get services by email
app.get("/users/:email/service", serviceController.getServiceByEmailController);
//------------> add an service
app.post("/service", serviceController.postController);

//------------> change status of service
app.put(
  "/service/:serviceId/:status",
  accessLevel,
  serviceController.putUpdateStatusController
);
//------------> delete
app.delete("/service/:serviceId", serviceController.deleteController);

//////////////////////////////////////////////////////////////////////////////////
/////         invoice                                            ////////////////
////////////////////////////////////////////////////////////////////////////////
//------------> get all invoices
app.get("/invoice", accessLevel, invoiceController.getController);
//------------> add an invoice
app.post("/invoice", accessLevel, invoiceController.postController);
//------------> get an invoice by invoiceId
app.get("/invoice/:id", accessLevel, invoiceController.getByIdController);
//------------> get an invoice by email
app.get("/users/:email/invoice", invoiceController.getInvoiceByEmailController);

//------------> add items
app.post(
  "/invoice/:invoiceId",
  accessLevel,
  invoiceController.postItemController
);
//------------> delete items
app.delete(
  "/invoice/:invoiceId/:itemId",
  accessLevel,
  invoiceController.deleteItemController
);
//------------> delete invoice
app.delete(
  "/invoice/:invoiceId",
  accessLevel,
  invoiceController.deleteController
);

//////////////////////////////////////////////////////////////////////////////////
/////         parts                                              ////////////////
////////////////////////////////////////////////////////////////////////////////
//------------> get all parts
app.get("/parts", partsController.getController);
//------------> add a part
app.post("/parts", accessLevel, partsController.postController);
//------------> get a part by slug
app.get("/parts/:id", partsController.getByIdController);
//------------> delete
app.delete("/parts/:slug", accessLevel, partsController.deleteController);

//////////////////////////////////////////////////////////////////////////////////
/////        logout                                              ////////////////
////////////////////////////////////////////////////////////////////////////////
app.post("/logout", logout);

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  //console.log(process.env.MONGO_URI)
});

app.use((req, res) => {
  res.status(404).json({
    error: 404,
    message: "Route not found",
  });
});
