const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var NewsSchema = new Schema({
  link: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  byline: {
    type: String,
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  saved: {
    type: Boolean,
    default: false
  },
  notes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comments"
    }
  ]
});

var News = mongoose.model("News", NewsSchema);

module.exports = News;
