var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

var root = path.join(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("public pages expose visible keyboard focus styles", function () {
  assert.match(read("index.html"), /:focus-visible/);
  assert.match(read("assets/css/checkout.css"), /:focus-visible/);
  assert.match(read("assets/css/video-sales.css"), /:focus-visible/);
  assert.match(read("assets/css/knowledge.css"), /:focus-visible/);
  assert.match(read("assets/css/trust-pages.css"), /:focus-visible/);
  assert.match(read("assets/css/library.css"), /:focus-visible/);
});

test("compact mobile navigation controls have enlarged tap targets", function () {
  assert.match(read("index.html"), /\.library-link\s*\{[^}]*min-height:\s*32px/);
  assert.match(read("assets/css/checkout.css"), /\.back\s*\{[^}]*min-height:\s*32px/);
  assert.match(read("assets/css/video-sales.css"), /\.back-link\s*\{[^}]*min-height:\s*32px/);
  assert.match(read("knowledge.html"), /\.detail-back\{min-height:32px\}/);
  assert.match(read("policies.html"), /\.footer-links a\{min-height:32px/);
  assert.match(read("assets/css/library.css"), /\.footer p a\s*\{[^}]*min-height:\s*32px/);
});
