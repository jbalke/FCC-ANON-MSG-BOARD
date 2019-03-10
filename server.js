"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var expect = require("chai").expect;
var cors = require("cors");
var helmet = require("helmet");
var mongoose = require("mongoose");

var apiRoutes = require("./routes/api.js");
var fccTestingRoutes = require("./routes/fcctesting.js");
var runner = require("./test-runner");

require("dotenv").config();

var app = express();

app.use(
  helmet({
    referrerPolicy: { policy: "same-origin" },
    frameguard: { action: "sameorigin" }
  })
);

app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(process.env.DB, { useNewUrlParser: true, autoIndex: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", console.log.bind(console, "database connected"));

//Sample front-end
app.route("/b/:board/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/board.html");
});
app.route("/b/:board/:threadid").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/thread.html");
});

//Index page (static HTML)
app.route("/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
apiRoutes(app);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "test" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.type("txt");
  res.send(res.locals.error);
});
//Sample Front-end

//Start our server and tests!
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on port " + port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function() {
      try {
        runner.run();
      } catch (e) {
        var error = e;
        console.log("Tests are not valid:");
        console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
