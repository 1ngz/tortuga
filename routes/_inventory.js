module.exports = (app, db) => {

  const async = require("async");
  const express = require('express');
  const router = express.Router();
  const url = require("url");

  /*  router.use((req, res) => {
      if (!req.session.user) {
        console.log("로그인 정보 없음");
        res.redirect("/login");
      }
    });*/

  router.get("/", (req, res) => {

    async.waterfall([
        function (callback) { //인벤토리에 있는 상품별 개수를 파악하는 쿼리.
          const sql = `select productid, count(*) as count from productlist.inventory 
          where userid = '${req.session.user.id}' group by productid;`;
          db.query(sql, (err, count) => {
            if (err) throw err;
            else {
              //카운트 쿼리 실행
              callback(null, count);
            }
          });
        },
        function (count, callback) { //인벤토리에 있는 상품의 이름을 가져오는 쿼리
          let countArr = new Array();
          for (let i = 0; i < count.length; i++) {
            countArr.push(count[i].productid);
          }
          if (countArr.length !== 0) {
            const sql = `select name from productlist.Product where id in (${countArr});`;
            db.query(sql, (err, product) => {
              if (err) throw err;
              else {
                callback(null, count, product);
              }
            });
          } else {
            const product = 0;
            callback(null, count, product);
          }
        },
      ],
      (err, count, product) => {
        if (err) console.log(err);
        else {
          //count[0] : 제품ID/제품별 개수(count)
          //product[0] : 제품명
          let src = `<div id="container">`;
          for (let i = 0; i < product.length; i++) {
            src += `<button class="product" name="${product[i].name}">${product[i].name} ${count[i].count}</button>`;
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
    *(select count(*) as count from productlist.inventory 
    where userid = '${req.session.user.id}' AND productid = (select id from productlist.product where name = '${querydata.product}'));`;
    //팔린 물건의 개수만큼 gold를 추가하는 쿼리

    const sql = `delete from productlist.inventory where userid = '${req.session.user.id}' and productid = 
    (select id from productlist.product where name = '${querydata.product}');`;
    //인벤토리에서 삭제하는 쿼리

    const gold_check = `select gold from productlist.user where id='${req.session.user.id}'`;
    //골드 쿼리


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