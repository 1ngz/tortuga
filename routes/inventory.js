module.exports = function (app, db) {

  const async = require("async");
  const express = require('express');
  const router = express.Router();
  const url = require("url");

  router.get("/", (req, res) => {
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

  router.get("/sell", (req, res) => {
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

  return router; //라우터를 리턴
};