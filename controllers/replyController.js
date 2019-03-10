"use strict";

const Reply = require("../models/reply");
const Thread = require("../models/thread");

exports.reply_get = function(req, res) {};

exports.reply_post = async function(req, res) {
  var { text, delete_password, thread_id } = req.body;
  var { board } = req.params;

  var reply = new Reply({ text, delete_password, thread: thread_id });
  try {
    var doc = await reply.save();
    var result = await Thread.updateOne(
      { _id: thread_id },
      { bumped_on: new Date(), $push: { replies: doc._id } }
    );
    //console.log(result);
  } catch (err) {
    console.log(err);
  }

  console.log(doc);
  res.redirect(`/b/${board}`);
};

exports.reply_put = function(req, res) {};

exports.reply_delete = function(req, res) {};
