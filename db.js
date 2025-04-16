const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const Users = new Schema({
  email: "String",
  password: "String",
  name: "String",
});

const Todos = new Schema({
  title: "String",
  status: Boolean,
  userId: ObjectId,
});

const UserModel = mongoose.model("users", Users);
const TodosModel = mongoose.model("todos", Todos);

module.exports = {
  UserModel: UserModel,
  TodosModel: TodosModel,
};
