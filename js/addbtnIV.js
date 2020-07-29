'use strict'
const PRODUCT = document.getElementsByClassName('product');

let btn = 0;
for (let i = 0; i < PRODUCT.length; i++) {

  PRODUCT[i].onclick = function () {

    const del = document.getElementsByClassName('additional');
    if (btn > 0) {
      PRODUCT[0].parentNode.removeChild(del[0]);
    }

    const node = document.createElement('div'); //요소 생성
    node.className = 'additional';

    const btnsell = document.createElement('button');
    const name = PRODUCT[i].getAttribute('name');
    node.setAttribute('onclick', `location.href='/inventory/sell/?product=${name}'`);

    const btn2 = document.createElement('button');
    const btn3 = document.createElement('button'); //요소 생성

    btnsell.innerText = '판매';
    btn2.innerText = '미구현기능';
    btn3.innerText = '미구현기능';

    node.appendChild(btnsell);
    node.appendChild(btn2);
    node.appendChild(btn3); //요소 + 텍스트


    PRODUCT[i].parentNode.insertBefore(node, PRODUCT[i + 1]);
    btn = 1;
  };
};