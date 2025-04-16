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
//auth middleware

function authMiddleware(req, res, next) {
  try {
    const token = req.headers.token;
    const decodedToken = jwt.verify(token, secret);

    if (decodedToken) {
      req.userId = decodedToken.id; //passing the users id of the verified token
      next();
    } else {
      res.status(403).json({
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.log(error + " there is some error while verifying the token");
  }
}
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
    console.log(user);
    if (!user) {
      //if the user is not present
      res.status(404).json({
        message: "Invalid user or password",
      });
    }
    //if the user is present then assign it a token
    // console.log(user._id);// this will return the id of the user which is of object type
    console.log({
      id: user._id.toString(),
    });

    const token = jwt.sign(
      {
        id: user._id.toString(), //i am giving the payload for token generation as the id of the user
      },
      secret
    );

    res.json({
      message: "the token have been generated  you are logged in",
      token,
    });
  } catch (error) {}
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
