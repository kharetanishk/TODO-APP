const bcrypt = require("bcrypt");

function SignInMiddleware(model) {
  return async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const user = await model.findOne({
        email: email,
      });
      console.log(user);
      if (!user) {
        return res.status(403).json({
          message: "ACCOUNT DOESN'T EXIST, TRY SIGNING UP",
        });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({
          message: "INVALID PASSWORD",
        });
      }
      req.user = user;
      next();
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "SERVER ERROR, TRY AGAIN LATER",
      });
    }
  };
}

module.exports = {
  SignInMiddleware,
};
