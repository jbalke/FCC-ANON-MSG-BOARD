"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const expect = require("chai").expect;
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

require("dotenv").config();

const app = express();

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

mongoose.set("useCreateIndex", true);

mongoose.connect(process.env.DB, { useNewUrlParser: true, autoIndex: true });
const db = mongoose.connection;
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
let port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on port " + port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function() {
      try {
        runner.run();
      } catch (e) {
        let error = e;
        console.log("Tests are not valid:");
        console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
