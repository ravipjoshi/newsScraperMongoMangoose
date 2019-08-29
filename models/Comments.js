const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var commentSchema = new Schema({
  author: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  }
});

var Comments = mongoose.model("Comments", commentSchema);

module.exports = Comments;