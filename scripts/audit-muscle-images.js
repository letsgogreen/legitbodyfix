"use strict";

var path = require("path");
var database = require(path.join(__dirname, "..", "assets", "data", "knowledge-base.json"));
var muscles = Array.isArray(database.muscles) ? database.muscles : [];

function validHttps(value) {
  return typeof value === "string" && /^https:\/\//i.test(value.trim());
}

function duplicateGroups(items, field) {
  var grouped = new Map();
  items.forEach(function (item) {
    var value = typeof item[field] === "string" ? item[field].trim() : "";
    if (!value) return;
    if (!grouped.has(value)) grouped.set(value, []);
    grouped.get(value).push(item.id || item.title || "unknown");
  });
  return Array.from(grouped.entries())
    .filter(function (entry) { return entry[1].length > 1; })
    .sort(function (a, b) { return b[1].length - a[1].length; });
}

var missingImage = muscles.filter(function (item) { return !validHttps(item.imageUrl); });
var missingAlt = muscles.filter(function (item) { return !item.imageAlt || !String(item.imageAlt).trim(); });
var missingCredit = muscles.filter(function (item) { return !item.imageCredit || !String(item.imageCredit).trim(); });
var missingCreditUrl = muscles.filter(function (item) { return !validHttps(item.imageCreditUrl); });
var duplicateImages = duplicateGroups(muscles, "imageUrl");

console.log("Muscle image audit");
console.log("==================");
console.log("Total muscles: " + muscles.length);
console.log("Missing/invalid image URL: " + missingImage.length);
console.log("Missing alt text: " + missingAlt.length);
console.log("Missing credit: " + missingCredit.length);
console.log("Missing/invalid credit URL: " + missingCreditUrl.length);
console.log("Shared image groups: " + duplicateImages.length);

if (missingImage.length) console.log("\nMissing images:\n- " + missingImage.map(function (item) { return item.id; }).join("\n- "));
if (duplicateImages.length) {
  console.log("\nImages used by multiple muscles:");
  duplicateImages.forEach(function (entry) {
    console.log("- " + entry[1].join(", ") + "\n  " + entry[0]);
  });
}
