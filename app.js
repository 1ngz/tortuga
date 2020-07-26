const express = require("express");
const http = require("http");
const path = require("path");
const static = require("serve-static");
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "buythings",
  password: "buythings",
  database: "productlist",
});
db.connect();

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
  const sql = `select * from productlist.Product;`;

  function DBquery() {
    return new Promise((resolve, reject) => {
      db.query(sql, (err, DBproduct) => {
        if (err) throw err;
        else {
          let i = 0;
          let product = new Array();
          for (; i < DBproduct.length; i++) {
            product.push(DBproduct[i].name);
          }
          if (i === DBproduct.length) {
            resolve(product);
          }
        }
      });
    });
  }
  DBquery().then((product) => {
    let src = `<div id="container">`;
    for (let i = 0; i < product.length; i++) {
      src += `<button class="product" name="product${i}">${product[i]}</button>`;
    }
    src += `</div>`;
    console.log(src);
    const data = {
      list: src,
    };
    res.render("buy.ejs", data);
  });
});


app.get("/buy/buythings", (req, res) => {
  console.log("buy");
  const sql = `insert TABLE values(,,);`; //insert OrderList Values (itemnumber, usernumber) 테이블 미구현

  function DBquery() {
    return new Promise((resolve, reject) => {
      db.query(sql, (err, DBOrder) => {
        if (err) throw err;
        else {
          console.log('insert 완료');
          resolve();
        }
      });
    });
  }

  DBquery().then(() => {
    res.redirect('/buy');
  })
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