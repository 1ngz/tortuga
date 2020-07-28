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
const session = require("express-session");;

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

app.get("/login", (req, res) => {
  res.render('login.ejs');
});

app.post("/login/check", (req, res) => {
  console.log("로그인 요청");
  const ID = req.body.loginID;
  const PW = req.body.loginPW;
  const sql = `select * from productlist.user where id = '${ID}';`;


  db.query(sql, (err, DBuser) => {
    if (err) throw err;
    else {
      const DBPW = DBuser[0].pw;
      if (PW === DBPW) { //여기서 pw가 정의가 안됨.
        if (req.session.user) {
          console.log("이미 로그인됨");
        } else {
          console.log("로그인 성공");
          req.session.user = {
            id: DBuser[0].id,
            //name : 추후에 닉네임 추가
          };
        }
        res.redirect("/menu");

      } else {
        console.log('로그인 오류');
        res.redirect("/login");
      }
    }
  });
});

app.get("/menu", (req, res) => {
  if (!req.session.user) {
    console.log("로그인 정보 없음");
    res.redirect("/login");
  } else {
    res.render("menu.ejs");
  }
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
      src += `<button class="product" name="${product[i]}">${product[i]}</button>`;
    }
    src += `</div>`;

    const data = {
      list: src,
    };
    res.render("buy.ejs", data);
  });
});

app.get("/buy/buythings", (req, res) => {
  console.log("page : buy");

  const _url = req.url;
  const querydata = url.parse(_url, true).query;

  const sql = `insert into productlist.orderlist(userid,productid) values('dlwlgur7',
  (select id from productlist.product where name = '${querydata.product}'));`; //product id는 선택 버튼에 따라 다르게 작동

  function DBquery() {
    return new Promise((resolve, reject) => {
      db.query(sql, (err, DBOrder) => {
        if (err) throw err;
        else {
          console.log("insert 완료");
          resolve();
        }
      });
    });
  }
  DBquery().then(() => {
    res.redirect("/buy");
  });
});

app.get("/sell", (req, res) => {
  console.log("sell");
});

app.get("/inventory", (req, res) => {
  console.log("inventory");
  const sql = `select name from productlist.Product where id in 
  (select productid from productlist.orderlist where userid = 'dlwlgur7');`;
  //인벤토리에 있는 상품의 이름을 가져오는 쿼리

  const countsql = `select productid, count(*) as count from productlist.orderlist 
  where userid = 'dlwlgur7' group by productid;`;
  //인벤토리에 있는 상품별 개수를 파악하는 쿼리.

  async.series(
    [
      function (callback) {
        db.query(sql, (err, product) => {
          if (err) throw err;
          else {
            callback(null, product);
          }
        });
      },
      function (callback) {
        db.query(countsql, (err, count) => {
          if (err) throw err;
          else {
            //카운트 쿼리 실행
            callback(null, count);
          }
        });
      },
    ],
    (err, product) => {
      if (err) console.log(err);
      else {
        //product[0] : 제품명
        //product[1] : 제품ID/제품별 개수(count)

        let src = `<div id="container">`;
        for (let i = 0; i < product[0].length; i++) {
          src += `<button class="product" name="${product[0][i].name}">${product[0][i].name} ${product[1][i].count}</button>`;
        }
        src += `</div>`;

        const data = {
          list: src,
        };

        res.render("inventory.ejs", data);
      }
    }
  );
});

app.get("/inventory/sell", (req, res) => {
  //판매 요청 시
  console.log("page : buy");

  const _url = req.url;
  const querydata = url.parse(_url, true).query;

  const sql = `delete from productlist.orderlist where userid = 'dlwlgur7' and productid = 
  (select id from productlist.product where name = '${querydata.product}');`;

  function DBquery() {
    return new Promise((resolve, reject) => {
      db.query(sql, (err, DBOrder) => {
        if (err) throw err;
        else {
          console.log("delete 완료");
          resolve();
        }
      });
    });
  }

  DBquery().then(() => {
    res.redirect("/inventory");
  });
});

app.listen(3001, function () {
  console.log("start!! express server port on 3001!!");
});