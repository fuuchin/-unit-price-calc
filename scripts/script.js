'use strict';
const id = id => document.getElementById(id);

const unitCostCalcPieceInput   = id('unitcost-calc-piece');
const unitCostCalcUnitSelect   = id('unitcost-calc-unit');
const unitCostCalcPriceInput   = id('unitcost-calc-price');
const unitCostCalcYenDolSelect = id('unitcost-calc-yen-dol');
const unitCostCalcOkBtn        = id('unitcost-calc-ok');
const tableDisplay             = id('table-display');
const tableTrAdd               = id('table-tr-add');
const detailArea               = id('detail');
const goodsNameInput           = id('goods-name');
const shopNameInput            = id('shop-name');
const closeBtn                 = id('close-btn');
const saveBtn                  = id('save-btn');
const back                     = id('back');

let priceData = [];

tableDisplayCheck();

unitCostCalcOkBtn.addEventListener('click', () => {
  const pieceValue = unitCostCalcPieceInput.value;
  const priceValue = unitCostCalcPriceInput.value;

  if(pieceValue.length === 0 || priceValue.length === 0) {
    alert('入力欄に空白があると思われます。');
    return;
  }

  let piece  = parseInt(pieceValue) || 1;
  let unit   = unitCostCalcUnitSelect.value;
  let price  = parseInt(priceValue) || 0;
  let yenDol = unitCostCalcYenDolSelect.value;
  let unitCostResult = unitCostCalc(piece, unit, price, yenDol);

  let unitCostUnitResult = unitCostResult.unit;
  let unitCostPriceSpan = unitCostResult.price;
  let goodsString = `${piece + unit}で${price + yenDol}`;

  priceData.push({goods: goodsString, priceStrong: unitCostPriceSpan, priceSpan: ` / ${unitCostUnitResult}`});

  tableAdd();
  tableDisplayCheck();

  unitCostCalcPieceInput.value = '';
  unitCostCalcPriceInput.value = '';
}, false);

/**
 * 入力されたものを計算して「1個当たり何円」とかの表示にする関数
 * @param {number} piece 個数・量
 * @param {string} unit 「個」とか「g」とかの単位
 * @param {number} price 値段
 * @param {string} yenDol 値段の単位
 * @return {string} 「1個当たり何円」とかの表示
 */
function unitCostCalc(piece, unit, price, yenDol) {
  return {unit, price: Math.round(price / piece * 100) / 100 + yenDol};
}

/**
 * 「何個で何円　1個当たり何円」という表の一行を追加するために、tbodyタグの子要素としてtrタグとtdタグを追加する関数
 */
function tableAdd() {
  tableTrAdd.innerText = '';
  goodsNameInput.value = '';
  shopNameInput.value = '';

  for(let i = 0; i < priceData.length; i++) {
    saveBtn.addEventListener('click', () => {
      const today = new Date();
      const month = today.getMonth() + 1; // 月は0から数えてしまうので1を足す
      const day = today.getDate(); // 日にちを取得
      const dayofweek = today.getDay(); // 曜日を取得(0~6で 0は日曜日、6は土曜日)

      function dateExpression() {
        const dayname = ['日', '月', '火', '水', '木', '金', '土']; // 曜日は番号で取得するので配列が必要
        const result = (`${month}月${day}日(${dayname[dayofweek]})`);
        return result;
      }

      const blob = new Blob([`${dateExpression()}、${shopNameInput.value}にあった「${goodsNameInput.value}」は、${priceData[i].priceStrong + priceData[i].priceSpan}です。`], { type: 'text/plain' });
      const aTag = document.createElement('a');
      aTag.setAttribute('href', URL.createObjectURL(blob));
      aTag.setAttribute('download', goodsNameInput.value + '.txt');
      aTag.setAttribute('target', '_blank');
      aTag.click();

      back.style.display = 'none';
      detailArea.style.transform = 'translate(0, -1000%)';
    }, false);

    const trElement = document.createElement('tr'); // 追加する一行
    const goodsTd = document.createElement('td');
    goodsTd.innerText = priceData[i].goods;
    const priceElement = document.createElement('td'); // 値段（真ん中）のtd
    const unitSpanElement = document.createElement('span'); // 普通の文字
    unitSpanElement.innerText = priceData[i].priceSpan;
    const priceStrongTd = document.createElement('strong'); // 太字
    priceStrongTd.innerText = priceData[i].priceStrong;
    const detailBtnTd = document.createElement('td'); // 詳細ボタン
    const detailBtn = document.createElement('button');
    detailBtn.innerText = '詳細';
    detailBtn.setAttribute('class', 'btn btn-info btn-sm'); // bootstrapのinfoのボタンデザインを適用
    const delBtnTd = document.createElement('td'); // 削除ボタン
    const delBtn = document.createElement('button');
    delBtn.innerText = '削除';
    delBtn.setAttribute('class', 'btn btn-danger btn-sm'); // bootstrapのdangerのボタンデザインを適用
    priceElement.appendChild(priceStrongTd); // 太字を追加する
    priceElement.appendChild(unitSpanElement); // 普通の文字と
    detailBtnTd.appendChild(detailBtn); // 詳細のtd
    delBtnTd.appendChild(delBtn); // 削除のtd
    trElement.appendChild(goodsTd);
    trElement.appendChild(priceElement); // 値段の単位tdと
    trElement.appendChild(detailBtnTd);
    trElement.appendChild(delBtnTd); // 削除のtdを trに追加する
    tableTrAdd.insertBefore(trElement, tableTrAdd.firstChild); // trをtbodyに追加する

    delBtn.addEventListener('click', () => {
      if(confirm('削除すると、もう元に戻せません。\n本当に削除しますか？')) {
        deletePriceData(i);
      } else {
        return;
      }
    }, false);

    detailBtn.addEventListener('click', () => {
      goodsNameInput.value = '';
      shopNameInput.value = '';
      back.style.display = 'block';
      detailArea.style.transform = 'translate(-50%, 0)';
    }, false);

    closeBtn.addEventListener('click', () => {
      back.style.display = 'none';
      detailArea.style.transform = 'translate(0, -1000%)';
    }, false);
  }
}




function tableDisplayCheck() {
  if(tableTrAdd.childElementCount) {
    tableDisplay.style.display = 'block';
  } else {
    tableDisplay.style.display = 'none';
  }
}

function deletePriceData(priceDataIndex) {
  priceData.splice(priceDataIndex, 1);
  tableAdd();
  tableDisplayCheck();
}
