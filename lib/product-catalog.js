"use strict";

var videos = require("../assets/data/videos.json");

var BUNDLE = {
  id: "neck-shoulder-reset",
  title: "Full Body Restoration Package",
  amount: "170.00",
  currency: "USD"
};

function canonicalProductId(value) {
  return value === "shoulder-reset" ? "ankle-sprain-rehabilitation" : value;
}

function formatAmount(price) {
  return Number(price).toFixed(2);
}

function getVideoProducts() {
  return (Array.isArray(videos) ? videos : [])
    .filter(function (video) {
      return video && video.published !== false && typeof video.id === "string" &&
        Number.isFinite(Number(video.price)) && Number(video.price) > 0;
    })
    .map(function (video) {
      return {
        id: video.id,
        title: (video.title || video.id) + " — Single Session",
        amount: formatAmount(video.price),
        currency: "USD"
      };
    });
}

function getCatalog() {
  return [BUNDLE].concat(getVideoProducts());
}

function getProduct(productId) {
  var id = typeof productId === "string" ? canonicalProductId(productId.trim()) : "";
  if (!id) return null;
  return getCatalog().find(function (product) { return product.id === id; }) || null;
}

module.exports = {
  BUNDLE: BUNDLE,
  canonicalProductId: canonicalProductId,
  getCatalog: getCatalog,
  getProduct: getProduct
};
