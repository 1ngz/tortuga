module.exports = (app, db) => {

  const url = require('url');
  const express = require('express');
  const async = require('async');
  const router = express.Router();


  //buy시 선정된 5개의 데이터는 30분마다 바뀐다. 서버는 30분마다 '/' 요청을 받아 새로운 list를 만든다.
  //기존 리스트에서 구매시 항목이 삭제되도록 해야함 -> JS -> display:none 및 항목 변경 불가능..
  //'/' 요청은 유저가 아닌 서버에서 이루어지도록 할 것. 

  router.get("/", (req, res) => {
    const sql = `select * from productlist.Product order by rand() limit 5;`;
    //아이템 5개 랜덤으로 뽑기

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

    const sql = `insert into productlist.inventory(userid,productid) values('${req.session.user.id}',
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