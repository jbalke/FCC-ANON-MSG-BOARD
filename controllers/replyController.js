"use strict";

const Reply = require("../models/reply");
const Thread = require("../models/thread");

exports.reply_get = async function(req, res) {
  let { thread_id } = req.query;
  let { board } = req.params;

  try {
    let result = await Thread.findOne(
      { _id: thread_id },
      {
        reported: 0,
        delete_password: 0,
        "replies.reported": 0,
        "replies.delete_password": 0,
        __v: 0
      }
    ).populate({ path: "replies", select: "text created_on" });

    res.json(result);
  } catch (err) {
    console.log(err);
  }
};

exports.reply_post = async function(req, res) {
  let { text, delete_password, thread_id } = req.body;
  let { board } = req.params;

  let reply = new Reply({ text, delete_password, thread: thread_id });
  try {
    let doc = await reply.save();
    await Thread.updateOne(
      { _id: thread_id },
      { bumped_on: new Date(), $push: { replies: doc._id } }
    );
  } catch (err) {
    console.log(err);
  }

  res.redirect(`/b/${board}`);
};

exports.reply_put = async function(req, res) {
  let { board } = req.params;
  let { thread_id, reply_id } = req.body;

  try {
    let result = await Reply.updateOne({ _id: reply_id }, { reported: true });
    if (result.ok === 1) {
      return res.type("txt").send("success");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.reply_delete = async function(req, res) {
  let { thread_id, delete_password, reply_id } = req.body;
  let { board } = req.params;

  try {
    let result = await Reply.updateOne(
      { _id: reply_id, delete_password },
      { text: "[deleted]" }
    );
    if (result.nModified === 1) {
      return res.type("txt").send("success");
    } else {
      return res.type("txt").send("incorrect password");
    }
  } catch (err) {
    console.log(err);
  }
};
