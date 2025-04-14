const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const shooter = process.env.JWT_SECRET;
const mongoUrl = process.env.MONGO_URL;
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
const app = express();
const { UserModel, TodosModel } = require("./db");
const port = 2000;
app.use(express.json());

//non-authenticated endpoints
app.post("/signup", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  await UserModel.create({
    email: email,
    password: password,
    name: name,
  });

  res.json({
    message: "you are logged in",
  });
});

app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const user = await UserModel.findOne({
    email: email,
    password: password,
  });
  console.log(user);
  if (!user) {
    return res.json({
      message: "invalid user",
    });
  }

  const token = jwt.sign(
    {
      id: user._id, //this id in the users collection is used to relate with
      //for others collection to communicate
    },
    shooter
  );
  res.json({
    message: "the user is logged in",
    token: token,
  });
});

//authenticated end points
app.get("/get-todos", function (req, res) {
  res.json({
    message: "getting todos",
  });
});
app.post("/post-todos", function (req, res) {
  res.json({
    message: "posting todos",
  });
});

app.listen(port, () => {
  console.log(`the app is listening to the port ${port}`);
});
