"use strict";

const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let ThreadSchema = new Schema({
  text: {
    type: String,
    max: 200,
    trim: true,
    required: [true, "New thread must have content."]
  },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: String,
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Reply"
    }
  ],
  board: {
    type: String,
    max: 16,
    lowercase: true,
    trim: true,
    required: [true, "New thread must be assigned to a board."]
  }
});

ThreadSchema.index({ board: 1, created_on: 1, _id: 1 }, { unique: true });

module.exports = mongoose.model("Thread", ThreadSchema);
