module.exports = (app, db) => {

  const url = require('url');
  const express = require('express');
  const async = require('async');
  const router = express.Router();


  router.get("/", (req, res) => {

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
        gold: req.session.user.gold,
      };
      res.render("buy.ejs", data);
    });
  });


  router.get("/buythings", (req, res) => {
    const _url = req.url;
    const querydata = url.parse(_url, true).query;

    const sql = `insert into productlist.orderlist(userid,productid) values('${req.session.user.id}',
                (select id from productlist.product where name = '${querydata.product}'));`;
    //product id는 선택 버튼에 따라 다르게 작동

    const gold_sql = `update productlist.user 
    SET gold=gold-(select price from productlist.product where name = '${querydata.product}')
    where id = '${req.session.user.id}'`; //유저 정보에서 골드를 가격만큼 빼서 업데이트하는 쿼리

    const gold_check = `select gold from productlist.user where id = '${req.session.user.id}'`
    //업데이트된 골드를 출력

    async.series([
        function (callback) {
          db.query(sql, (err, DBresult) => {
            if (err) throw err;
            else {
              callback(null);
            }
          });
        },
        function (callback) {
          db.query(gold_sql, (err, DBresult) => {
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
          })
        }
      ],

      (err, DBgold) => {
        if (err) throw err;
        else {
          req.session.user.gold = DBgold[2][0].gold;
          res.redirect("/buy");
        }
      });
  });


  return router; //라우터를 리턴
};