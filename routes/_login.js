module.exports = (app, db) => {

  const express = require('express');
  const router = express.Router();


  router.get("/", (req, res) => {
    res.render('login.ejs');
  });

  router.post("/check", (req, res) => {
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
              name: DBuser[0].name,
              gold: DBuser[0].gold, //돈 기능..
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


  return router; //라우터를 리턴
};