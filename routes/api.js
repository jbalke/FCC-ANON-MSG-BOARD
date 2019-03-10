/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
var threadControlller = require("../controllers/threadController");
var replyController = require("../controllers/replyController");

var expect = require("chai").expect;

module.exports = function(app) {
  app
    .route("/api/threads/:board")
    .get(threadControlller.thread_get)
    .post(threadControlller.thread_post)
    .put(threadControlller.thread_put)
    .delete(threadControlller.thread_delete);

  app
    .route("/api/replies/:board")
    .get()
    .post(replyController.reply_post)
    .put()
    .delete();

  //404 Not Found Middleware
  app.use(function(req, res, next) {
    res
      .status(404)
      .type("text")
      .send("Not Found");
  });
};
