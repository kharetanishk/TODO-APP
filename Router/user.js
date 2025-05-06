const { Router } = require("express");
const userRouter = Router();
const { UserModel, TodoModel } = require("../db");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SignUpMiddleware } = require("../Middleware/Signupauth");
const { SignInMiddleware } = require("../Middleware/SigninAuth");
const { authMiddleware } = require("../Middleware/auth");
require("dotenv").config();
const secret = process.env.JWT_SECRET;
const cookieParser = require("cookie-parser");

userRouter.use(cookieParser());

//SIGN UP
userRouter.post(
  "/signup",
  SignUpMiddleware(UserModel),
  async function (req, res) {
    const requiredBody = z.object({
      email: z
        .string()
        .email({
          invalid_type_error: "Invalid email address",
        })
        .trim()
        .toLowerCase(),
      password: z
        .string({
          required_error:
            "Password must be long and include uppercase, lowercase, and a number.",
        })
        .regex(/[A-Z]/, {
          message: "Password should contain one UpperCase letter",
        })
        .regex(/[a-z]/, {
          message: "Password should contain one lowerCase letter",
        })
        .regex(/[0-9]/, {
          message: "Password should contain one Numeric digit",
        })
        .min(6)
        .max(20),

      name: z
        .string({
          required_error: "Name must be provided",
        })
        .min(2, {
          invalid_type_error: "Name is too short",
        })
        .max(20, {
          invalid_type_error: "Name can contain 20 letters",
        })
        .trim(),
    });
    //LETS PARSE THE DATA
    const parseData = requiredBody.safeParse(req.body);

    if (!parseData.success) {
      return res.status(400).json({
        error: parseData.error.errors.map((err) => {
          return {
            field: err.path[0],
            message: err.message,
          };
        }),
      });
    }

    const { email, password, name } = req.body;
    try {
      //hashing the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 12);

      await UserModel.create({
        email: email,
        password: hashedPassword,
        name: name,
      });
      res.status(200).json({
        message: "SIGNUP SUCCESSFULLY",
      });
    } catch (error) {
      console.log(error);
      res.status(403).json({
        error: "SERVER ERROR WHILE SIGNNING UP",
        error,
      });
    }
  }
);

userRouter.post(
  "/signin",
  SignInMiddleware(UserModel),
  async function (req, res) {
    const { email, password } = req.body;
    const user = req.user;
    console.log(user);
    const userId = user._id;

    //STEP-1 ASSIGNING THE TOKEN
    const token = jwt.sign(
      {
        _id: userId,
      },
      secret,
      { expiresIn: "1h" }
    );

    //setting cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3600000, //1 hour
    });

    res.status(200).json({
      message: "User logged in",
      token,
    });
  }
);

//routes to post todos

userRouter.post("/addtodo", authMiddleware(secret), async function (req, res) {
  //we need to have the user
  const user = req.user;
  // console.log(user, +" " + `this is from the addtodo route`);

  if (!user) {
    return res.status(403).json({
      message: "Invalid user please log in again",
    });
  }
  //now the user has checked , its time for the crud operations

  const requiredBody = z.object({
    title: z
      .string({
        invalid_type_error: "Todo cannot be empty",
      })
      .toUpperCase()
      .trim(),
  });
  const parseData = requiredBody.safeParse(req.body);
  // console.log(parseData.data.todoString.length);

  if (parseData.data.title.length === 0) {
    return res.status(400).json({
      message: "Todos cannot be empty",
    });
  }

  if (!parseData.success) {
    return res.status(403).json({
      message: parseData.error.errors.map((err) => err.message),
    });
  }

  const { title } = req.body;

  try {
    await TodoModel.create({
      title: title,
    });

    res.status(200).json({
      message: "Todo added ",
      title: title,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server is not responding",
      error: error,
    });
  }
});

module.exports = {
  userRouter: userRouter,
};
