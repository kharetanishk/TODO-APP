//THIS IS THE DATABASE OF OUR TODO APPLICATION

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
});

const Todos = new Schema({
  title: String,
  timestamp: String,
  status: Boolean,
  User: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Goals = new Schema({
  setGoal: String,
  tillTime: String,
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const UserModel = mongoose.model("users", User);
const TodoModel = mongoose.model("todos", Todos);
const GoalModel = mongoose.model("goals", Goals);

//WE WILL USE THIS MODELS TO FOR DATA MANIPULATIONS IN ROUTERS
module.exports = {
  UserModel,
  TodoModel,
  GoalModel,
};
