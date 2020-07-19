const express = require("express");
const http = require("http");
const path = require("path");
const static = require("serve-static");

const ejs = require("ejs");

const bodyparser = require("body-parser");

let app = express();

app.use(static(path.join(__dirname, "/")));

app.set("port", process.env.PORT || 3001);
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("main.ejs");
});

app.get("/menu", (req, res) => {
  res.render("menu.ejs");
});

app.get("/buy", (req, res) => {
  console.log("buy");
});

app.get("/sell", (req, res) => {
  console.log("sell");
});

app.get("/inventory", (req, res) => {
  console.log("inventory");
});

http.createServer(app).listen(app.get("port"), function () {
  console.log("Server START..." + app.get("port"));
}); //서버 만들고 대기한다.

/*
app.listen(3000, function () {
  console.log("start!! express server port on 3000!!");
});  서버 대기 */
