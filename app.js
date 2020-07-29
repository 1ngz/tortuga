const express = require("express");
const http = require("http");
const path = require("path");
const static = require("serve-static");
const mysql = require("mysql");
const url = require("url");
const async = require("async");
const ejs = require("ejs");

const bodyParser = require("body-parser");
const cookie = require("cookie-parser");
const session = require("express-session");

const db = mysql.createConnection({
  host: "localhost",
  user: "buythings",
  password: "buythings",
  database: "productlist",
});

db.connect();

let app = express();

app.use(static(path.join(__dirname, "/")));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(
  session({
    key: "sid", //세션의 키 값
    secret: "secret", //비밀 키, 쿠키 값 변조를 막기 위해 암호화하여 저장
    resave: false, //세션을 항상 저장할 것인지. false 권장
    saveUninitialized: true, //저장되기 전에 uninitialize 상태로 저장
    cookie: {
      //쿠키 설정
      maxAge: 1000 * 60 * 10, // 쿠키 유효기간 10분 (단위ms)
    },
  })
);

app.set("port", process.env.PORT || 3001);
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("main.ejs");
});

/* /login 요청 라우터 */
const login = require("./routes/login.js")(app, db);
app.use("/login", login); //라우터 buy객체 app을 전달


app.get("/logout", function (req, res, next) {
  console.log(`${req.session.user.id}님 로그아웃 요청`);
  req.session.destroy(function () {
    console.log(`세션 삭제 완료. 로그아웃합니다.`);
  }); //세션 삭제
  res.clearCookie("sid");
  res.redirect("/login");
}); /*로그아웃 요청 시 처리 */


/* 메인메뉴로 렌더링 */
app.get("/menu", (req, res) => {
  const data = {
    gold: req.session.user.gold,
  };
  res.render("menu.ejs", data);
});

/* /buy 요청 라우터 */
const buy = require("./routes/buy.js")(app, db);
app.use("/buy", buy); //라우터 buy객체 app을 전달

/* /sell 요청 라우터 */
app.get("/sell", (req, res) => {
  console.log("미구현 기능");
  res.redirect("/menu");
});

/* /inventory 요청 라우터 */
const inventory = require("./routes/inventory.js")(app, db);
app.use("/inventory", inventory); //라우터 buy객체 app을 전달

app.listen(3001, function () {
  console.log("start!! express server port on 3001!!");
});