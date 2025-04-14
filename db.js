const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const Users = new Schema({
  email: String,
  password: String,
  name: String,
});

const Todos = new Schema({
  title: { type: String, unique: true },
  done: Boolean,
  userId: ObjectId,
});

const UserModel = new mongoose.model("users", Users);
const TodosModel = new mongoose.model("todos", Todos);

module.exports = {
  UserModel: UserModel,
  TodosModel: TodosModel,
};
