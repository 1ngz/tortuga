module.exports = (app, db) => {

  const async = require("async");
  const express = require('express');
  const router = express.Router();
  const url = require("url");

  router.get("/", (req, res) => {
    const sql = `select name from productlist.Product where id in 
    (select productid from productlist.orderlist where userid = '${req.session.user.id}');`;
    //인벤토리에 있는 상품의 이름을 가져오는 쿼리

    const countsql = `select productid, count(*) as count from productlist.orderlist 
    where userid = '${req.session.user.id}' group by productid;`;
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
            gold: req.session.user.gold,
          };

          res.render("inventory.ejs", data);
        }
      }
    );
  });

  router.get("/sell", (req, res) => {

    const _url = req.url;
    const querydata = url.parse(_url, true).query;


    const gold_sql = `update productlist.user SET gold=gold+
    (select price from productlist.product where name= '${querydata.product}')
    *(select count(*) as count from productlist.orderlist 
    where userid = '${req.session.user.id}' AND productid = (select id from productlist.product where name = '${querydata.product}'));`;

    const sql = `delete from productlist.orderlist where userid = '${req.session.user.id}' and productid = 
    (select id from productlist.product where name = '${querydata.product}');`;

    const gold_check = `select gold from productlist.user where id='${req.session.user.id}'`;

    async.series([
      function (callback) {
        db.query(gold_sql, (err, DBresult) => {
          if (err) throw err;
          else {
            callback(null);
          }
        });
      },
      function (callback) {
        db.query(sql, (err, DBresult) => {
          if (err) throw err;
          else {
            callback(null);
          }
        });
      },
      function (callback) {
        db.query(gold_check, (err, DBgold) => {
          if (err) throw err;
          else {
            callback(null, DBgold);
          }
        });
      }

    ], (err, DBgold) => {
      if (err) throw err;
      else {
        req.session.user.gold = DBgold[2][0].gold;
        res.redirect("/inventory");
      }

    });
  });

  return router; //라우터를 리턴
};