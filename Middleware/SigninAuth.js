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
          error: "ACCOUNT DOES'NT EXIST ,TRY SIGNNING UP",
        });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({
          error: "INVALID PASSWORD",
        });
      }
      req.user = user;
      next();
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "SERVER ERROR, TRY AGAIN LATER",
      });
    }
  };
}

module.exports = {
  SignInMiddleware,
};
