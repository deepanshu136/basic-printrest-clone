const mongoose = require("mongoose");
const plm=require('passport-local-mongoose')
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // Assuming Post is the name of your post model
  dp: { type: String },
  email: { type: String, required: true, unique: true },
  fullname: { type: String },
});


userSchema.plugin(plm)
module.exports = mongoose.model("User", userSchema);


