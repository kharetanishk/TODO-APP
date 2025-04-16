require("dotenv").config();
const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

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
module.exports = {
  authMiddleware,
};
