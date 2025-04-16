///required libraries to be imported at the top
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config(); //to have unexposable data in env file
const cors = require("cors"); //cross resource access
const mongoose = require("mongoose"); //database
const secret = process.env.JWT_SECRET;
const mongoUrl = process.env.MONGO_URL;
const { UserModel, TodosModel } = require("./db"); //importing the model from another js file
//established the connection between database and the backend server
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log(`mongoose connection successful`);
  })
  .catch((error) => {
    console.log(`mongoose connection has some error` + error);
  });
const app = express();
const port = 1601;
//global middleware
app.use(express.json());
app.use(cors());

//routes for the initial signup and sign in

//sign up
app.post("/signup", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    await UserModel.create({
      email: email,
      password: password,
      name: name,
    });
    res.json({
      message: "you are signned up",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occured during signup",
      error: error,
    });
  }
});

app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await UserModel.findOne({
      //findone finds the user with  required credentials in the databse
      email: email,
      password: password,
    });
    if (!user) {
      //if the user is not present
      res.status(404).json({
        message: "Invalid user or password",
      });
    }
    //if the user is present then assign it a token
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.json({
      message: "the token have been generated  you are logged in",
      token,
    });
  } catch (error) {}
});

//calling the app
app.listen(port, () => {
  console.log(`the app is running on port ${port}`);
});
