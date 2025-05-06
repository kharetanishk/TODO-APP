const jwt = require("jsonwebtoken");

function authMiddleware(secret) {
  return (req, res, next) => {
    const token = req.cookies.token;
    // console.log(token);

    if (!token) {
      return res.status(403).json({
        error: "INVALID AUTHENTICATION , PLEASE LOG IN AGAIN",
      });
    }

    try {
      const isValidUser = jwt.verify(token, secret);

      console.log("Verified user:", isValidUser);
      req.user = isValidUser;
      next();
    } catch (error) {
      res.status(400).json({
        error: "INVALID TOKEN",
      });
    }
  };
}

module.exports = {
  authMiddleware,
};
