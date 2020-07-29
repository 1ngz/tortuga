select * from productlist.Product;
select * from productlist.user;
select * from productlist.inventory;


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

CREATE TABLE productlist.user (
id varchar(25) PRIMARY KEY,
pw varchar(25),
name varchar(20),
gold int
);

CREATE TABLE productlist.inventory (
orderid int AUTO_INCREMENT PRIMARY KEY ,
userid varchar(25),
productid int not null
);

insert productlist.Product values(1,'콩이 옷',25000);
insert productlist.Product values(2,'불고기버거세트',13000);
insert productlist.Product values(3,'과학상자',40000);
insert productlist.Product values(4,'노트북',250000);
insert productlist.Product values(5,'집',25000000);
insert productlist.Product values(6,'먹다만 쓰레기',1500);
insert productlist.Product values(7,'불닭볶음면',800);
insert productlist.Product values(8,'달',125000000);
insert productlist.Product values(9,'아이패드',280000);
insert productlist.Product values(10,'마이크',243000);
insert productlist.Product values(11,'멍멍이',134500000);

insert productlist.user values('dlwlgur7','rename0206','이지혁',25000);
insert productlist.user values('mk2','rename0206','물콩',225000);
insert productlist.user values('test1','test1','테스터',3325000);
insert productlist.user values('test2','test2','테스터',3325000);
insert productlist.user values('test3','test3','테스터',3325000);

insert productlist.inventory values ('1','dlwlgur7',1);


select * from productlist.user where id = 'test1';
