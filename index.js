const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 9000;
require("dotenv").config();
const mongoUrl = process.env.MONGO_URL;
const { userRouter } = require("./Router/user");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json());

//Router
app.use("/user", userRouter);
// app.use("/user/todos", todoRouter);

//main function
async function main() {
  await mongoose
    .connect(mongoUrl)
    .then(() => {
      console.log("mongoose database connected successfully");
    })
    .catch((error) => {
      console.log(`database connection failed ${error}`);
    });

  app.listen(PORT, () => {
    console.log(`The app is listening to port ${PORT}`);
  });
}

main();
