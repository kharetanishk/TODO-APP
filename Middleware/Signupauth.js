function SignUpMiddleware(models) {
  return async (req, res, next) => {
    const { email } = req.body;

    try {
      const existingUser = await models.findOne({
        email: email,
      });
      if (existingUser !== null) {
        return res.status(400).json({
          error: "Account already exist,Try Signning In",
        });
      }

      if (existingUser === null) {
        //i have stored this newUser so it can once signup and signin simultaneously
        req.newUser = newUser;
      }
      next();
    } catch (error) {
      res.status(500).json({
        error: "SERVER PROBLEM , PLEASE TRY LATER",
        error,
      });
    }
  };
}

module.exports = {
  SignUpMiddleware,
};
