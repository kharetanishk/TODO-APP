///required libraries to be imported at the top
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config(); //to have unexposable data in env file
const cors = require("cors"); //cross resource access
const mongoose = require("mongoose"); //database
const secret = process.env.JWT_SECRET;
const mongoUrl = process.env.MONGO_URL; //url is inside env file
const { UserModel, TodosModel } = require("./db"); //importing the model from another js file
const { authMiddleware } = require("./auth"); //importing the auth
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
    const saltrounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltrounds);

    await UserModel.create({
      email: email,
      password: hashedPassword,
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
    const user = await UserModel.findOne({ email });
    // console.log(user);

    if (!user) {
      return res.status(403).json({
        message: "User not found",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(403).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user._id.toString() }, secret);

    res.json({
      message: "You are logged in, token generated!",
      token,
    });
  } catch (error) {
    console.log("Unexpected error in signin route:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//authentication needed todos routes

app.post("/todos", authMiddleware, function (req, res) {
  const userId = req.userId;
  const title = req.body.title;
  const status = req.body.status;
  //creating the values that can put in the todos
  TodosModel.create({
    title: title,
    userId,
    status: status,
  }); //inserting the values inside the todos model
  res.json({
    userId: userId,
  });
});
app.get("/todos", authMiddleware, async function (req, res) {
  const userId = req.userId;
  const todos = await TodosModel.find({
    userId: userId,
  });
  // const user = await UserModel.findOne({
  //   _id: userId,
  // });//getting the users also that corresponds the todos
  // console.log(user);
  res.json({
    todos,
    // name: user.name,
    // email: user.email,
    // password: user.password,
  });
});
//calling the app
app.listen(port, () => {
  console.log(`the app is running on port ${port}`);
});
