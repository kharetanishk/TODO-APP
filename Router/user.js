const { Router } = require("express");
const userRouter = Router();
const { UserModel } = require("../db");
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

module.exports = {
  userRouter: userRouter,
};
