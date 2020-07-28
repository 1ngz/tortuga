module.exports = function (app, db) {

  const url = require('url');
  const express = require('express');
  const router = express.Router();


  router.get("/", (req, res) => {

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


  router.get("/buythings", (req, res) => {
    console.log("page : buy");

    const _url = req.url;
    const querydata = url.parse(_url, true).query;

    const sql = `insert into productlist.orderlist(userid,productid) values('dlwlgur7',
                (select id from productlist.product where name = '${querydata.product}'));`;
    //product id는 선택 버튼에 따라 다르게 작동

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


  return router; //라우터를 리턴
};