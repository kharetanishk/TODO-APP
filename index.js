///required libraries to be imported at the top
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config(); //to have unexposable data in env file
const cors = require("cors"); //cross resource access
const mongoose = require("mongoose"); //database
const { z } = require("zod");
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
  //schema validation using zod library
  const requiredBody = z
    .object({
      email: z.string().min(3).max(40).email(),
      password: z
        .string()
        .min(6, "the password should be of minimum length 6")
        .max(30, "the maximum length of password exceeds")
        .regex(/[A-Z]/, "password should contain atleast one uppercase letter")
        .regex(/[a-z]/, "password should contain atlest one lowercase letter")
        .regex(/[0-9]/, "passwor should contain atleast one number"),
      name: z.string().min(3).max(40),
    })
    .strict(); //should follow this schema onlyany extra field will throw an error
  const parseData = requiredBody.safeParse(req.body); //will return a succes(boolean) and the data

  if (!parseData.success) {
    return res.status(400).json({
      error: parseData.error.errors.map(
        (err) => err.path + "field" + " -> " + err.message
      ), //mapping the error array and returning the path with the error
      message: "invalid credentials",
    });
  }

  console.log(parseData.data); //the correct data that passes all the validations
  //input crdentials
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    const saltrounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltrounds); //bcrypt is an external lib.

    await UserModel.create({
      email: email,
      password: hashedPassword,
      name: name,
    });
    res.status(200).json({
      message: "You are signned up",
    });
  } catch (err) {
    if (await UserModel.findOne({ email })) {
      res.status(500).json({
        message: "User already exist",
        err,
      });
    }
  }
});

app.post("/signin", async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    // console.log("USER Pss" + user.password);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log(validPassword);
    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: `Welcome again ${user.name}`,
      token,
    });
  } catch (error) {
    console.log("Error in sign in:", error);
    res.status(500).json({ message: "Internal server error" });
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
  const user = await UserModel.findOne({
    _id: userId,
  }); //getting the users also that corresponds the todos
  console.log(user);
  res.json({
    todos,
    name: user.name,
    // email: user.email,
    // password: user.password,
  });
});
//calling the app
app.listen(port, () => {
  console.log(`the app is running on port ${port}`);
});
//
