const mongoose = require("mongoose"); //path to use mongoose
const Schema = mongoose.Schema; //require the schema of mongoose
const ObjectId = mongoose.ObjectId; //unique id in mongo db

//describing the schema means structure of the database
const Users = new Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
});

const Todos = new Schema({
  title: String,
  userId: ObjectId, //this is used to refer the users collection
  status: Boolean,
});

//model is where i am storing the database
const UserModel = mongoose.model("users", Users); //adding the data in the collection users
const TodosModel = mongoose.model("todos", Todos); //adding the data in the collection todos

//export it so that it can be used in others js file
module.exports = {
  UserModel: UserModel,
  TodosModel: TodosModel,
};
