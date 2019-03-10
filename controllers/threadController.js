"use strict";

const Thread = require("../models/thread");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

exports.thread_post = async function(req, res) {
  var { text, delete_password } = req.body;
  var { board } = req.params;
  var boardView = `/b/${board}`;

  var newThread = new Thread({ text, delete_password, board });

  var doc = await newThread.save();
  res.redirect(boardView);
  console.log("thread saved:", doc);
};

//ToDo: Limit replies to top 3 by created_on
exports.thread_get = async function(req, res) {
  var { board } = req.params;

  try {
    // var result = await Thread.find({ board })
    //   .sort({ bumped_on: -1 })
    //   .limit(10)
    //   .populate("replies")
    //   .select({ reported: 0, delete_password: 0 });

    var result = await Thread.aggregate([
      { $match: { board } },
      { $sort: { bumped_on: -1 } },
      { $limit: 10 },
      {
        $project: {
          text: 1,
          created_on: 1,
          bumped_on: 1,
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

    //console.log(result);

    res.json(result);
  } catch (err) {
    console.log(err);
    res.type("txt").send("threads not found");
  }
};

exports.thread_put = function(req, res) {};

exports.thread_delete = function(req, res) {};
