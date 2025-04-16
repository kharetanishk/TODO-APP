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
  userId: ObjectId,
  status: Boolean,
});

const UserModel = mongoose.model("users", Users);
const TodosModel = mongoose.model("todos", Todos);

//export it so that it can be used in others js file
module.exports = {
  UserModel: UserModel,
  TodosModel: TodosModel,
};
