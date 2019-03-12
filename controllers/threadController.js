"use strict";

const Thread = require("../models/thread");
const Reply = require("../models/reply");
var xssFilters = require("xss-filters");

exports.thread_post = async function(req, res) {
  let { text, delete_password } = req.body;
  let { board } = req.params;
  let boardView = `/b/${board}/`;

  // sanitize post text
  let newThread = new Thread({
    text: xssFilters.inHTMLData(text),
    delete_password,
    board
  });

  let doc = await newThread.save();
  res.redirect(302, boardView);
  //console.log("thread saved:", doc);
};

exports.thread_get = async function(req, res) {
  let { board } = req.params;

  try {
    let result = await Thread.aggregate([
      { $match: { board } },
      { $sort: { bumped_on: -1 } },
      { $limit: 10 },
      {
        $project: {
          text: 1,
          created_on: 1,
          bumped_on: 1,
          reply_count: { $size: "$replies" },
          replies: { $slice: ["$replies", -3] }
        }
      },
      { $unwind: { path: "$replies", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "replies",
          localField: "replies",
          foreignField: "_id",
          as: "replies"
        }
      },
      { $unwind: { path: "$replies", preserveNullAndEmptyArrays: true } },
      { $sort: { "replies.created_on": -1 } },
      {
        $group: {
          _id: "$_id",
          text: { $first: "$text" },
          created_on: { $first: "$created_on" },
          bumped_on: { $first: "$bumped_on" },
          reply_count: { $first: "$reply_count" },
          replies: {
            $push: {
              _id: "$replies._id",
              text: "$replies.text",
              created_on: "$replies.created_on"
            }
          }
        }
      },
      { $sort: { bumped_on: -1 } },
      {
        $project: {
          text: true,
          created_on: true,
          bumped_on: true,
          reply_count: true,
          replies: {
            $cond: {
              if: { $eq: ["$replies", [{}]] },
              then: [],
              else: "$replies"
            }
          }
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    console.log(err);
    res.type("txt").send("threads not found");
  }
};

exports.thread_put = async function(req, res) {
  let { board } = req.params;
  let { thread_id } = req.body;

  try {
    let result = await Thread.updateOne({ _id: thread_id }, { reported: true });
    //console.log(result);

    if (result.nModified === 1) {
      return res.type("txt").send("success");
    } else {
      return res.type("txt").send("thread not found");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.thread_delete = async function(req, res) {
  let { thread_id, delete_password } = req.body;
  let { board } = req.params;

  try {
    let result = await Thread.deleteOne({
      _id: thread_id,
      delete_password
    });
    if (result.n === 1) {
      await Reply.deleteMany({ thread: thread_id });
      return res.type("txt").send("success");
    } else {
      return res.type("txt").send("incorrect password");
    }
  } catch (err) {
    console.log(err);
  }
};
