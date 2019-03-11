"use strict";

const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ReplySchema = new Schema({
  text: {
    type: String,
    max: 200,
    trim: true,
    required: [true, "Reply must have content."]
  },
  created_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: String,
  thread: { type: Schema.Types.ObjectId, ref: "Thread" }
});

//ReplySchema.index({ board: 1, created_on: 1, _id: 1 }, { unique: true });

module.exports = mongoose.model("Reply", ReplySchema);
