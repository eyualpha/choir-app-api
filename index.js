// Vercel entry when Root Directory is the monorepo root.
// Must import express here so Vercel's Express builder detects the app.
const express = require("express");

module.exports = require("./server/index.js");
