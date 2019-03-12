/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var { assert, expect } = chai;
var server = require("../server");
//var Browser = require("zombie");

chai.use(chaiHttp);

//Browser.site = "https://sly-infinity.glitch.me";

suite("Functional Tests", function() {
  let testPost = { text: "this is a test post", delete_password: "deleteMe" };
  let testId = 0;
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("Test POST /api/threads/:board with text and delete_password", function(done) {
        chai
          .request(server)
          .post("/api/threads/tests")
          .send(testPost)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite("GET", function() {
      test("Test GET /api/threads/:board", function(done) {
        chai
          .request(server)
          .get("/api/threads/tests")
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isTrue(res.body.length <= 10);
            assert.equal(res.body[0].text, testPost.text);
            assert.equal(res.body[0].created_on, res.body[0].bumped_on);
            assert.isTrue(res.body[0].replies <= 3);
            testId = res.body[0]._id;
            done();
          });
      });
    });

    suite("PUT", function() {
      test("Test PUT /api/threads/:board with thread_id", function(done) {
        chai
          .request(server)
          .put("/api/threads/tests")
          .send({ thread_id: testId })
          .end(function(err, res) {
            assert.equal(res.text, "success");
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("Test DELETE /api/threads/:board with thread_id and wrong delete_password", function(done) {
        chai
          .request(server)
          .delete("/api/threads/tests")
          .send({
            thread_id: testId,
            delete_password: "wrong password"
          })
          .end(function(err, res) {
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("Test DELETE /api/threads/:board with thread_id and delete_password", function(done) {
        chai
          .request(server)
          .delete("/api/threads/tests")
          .send({
            thread_id: testId,
            delete_password: testPost.delete_password
          })
          .end(function(err, res) {
            assert.equal(res.text, "success");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {
      //   chai
      //     .request(server)
      //     .post("/api/repies/tests")
      //     .send();
    });

    suite("GET", function() {});

    suite("PUT", function() {});

    suite("DELETE", function() {});
  });
});
