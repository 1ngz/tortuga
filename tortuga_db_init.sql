select * from productlist.Product;
select * from productlist.user;
select * from productlist.orderlist;


DROP DATABASE IF EXISTS  productlist;
DROP USER IF EXISTS  buythings@localhost;
create user buythings@localhost identified WITH mysql_native_password by 'root';
create database productlist;
grant all privileges on productlist.* to buythings@localhost with grant option;
commit;

USE productlist;

CREATE TABLE productlist.Product (
id int PRIMARY KEY auto_increment,
name varchar(25),
price int
);

drop table productlist.user;
CREATE TABLE productlist.user (
id varchar(25) PRIMARY KEY,
pw varchar(25),
name varchar(20),
gold int
);

CREATE TABLE productlist.orderlist (
orderid int AUTO_INCREMENT PRIMARY KEY ,
userid varchar(25),
productid int
);


insert productlist.Product values('콩이 옷',25000);
insert productlist.Product values('불고기버거세트',13000);
insert productlist.Product values('과학상자',40000);
insert productlist.Product values('노트북',250000);
insert productlist.Product values('집',25000000);


insert productlist.user values('dlwlgur7','rename0206','이지혁',25000);

insert productlist.orderlist values ('1','dlwlgur7',1);

    