const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    postText: { type: String, required: true },
    image:{type:String},
    createdAt: { type: Date, default: Date.now },
    likes: { type: Array, default: [] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});


//created a post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
