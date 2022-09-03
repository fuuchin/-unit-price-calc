'use strict';
const id = id => document.getElementById(id); // 省略

const unitCostCalcPieceInput   = id('unitcost-calc-piece'); // 個数インプット
const unitCostCalcUnitSelect   = id('unitcost-calc-unit'); // 個数単位セレクト
const unitCostCalcPriceInput   = id('unitcost-calc-price'); // 値段インプット
const unitCostCalcYenDolSelect = id('unitcost-calc-yen-dol'); // 値段単位セレクト
const unitCostCalcOkBtn        = id('unitcost-calc-ok'); // 決定ボタン
const tableDisplay             = id('table-display'); // tableタグそのもの
const tableTrAdd               = id('table-tr-add'); // 表の行を追加してくところ
const detailArea               = id('detail'); // 詳細エリア
const detailText               = id('detail-text'); // 詳細エリアのテキスト
const goodsNameInput           = id('goods-name'); // 商品名インプット
const shopNameInput            = id('shop-name'); // 店舗名インプット
const closeBtn                 = id('close-btn'); // 詳細閉じるボタン
const saveBtn                  = id('save-btn'); // 保存ボタン
const back                     = id('back'); // 詳細出てる間のバックの黒のぼかし
const allDelBtn                = id('all-delete-btn'); // すべて削除ボタン

let priceData = [];
let downloadOk = true; // ダウンロード処理を実行してよいかのフラグ

tableDisplayCheck();

unitCostCalcOkBtn.addEventListener('click', () => {
  const pieceValue = unitCostCalcPieceInput.value;
  const priceValue = unitCostCalcPriceInput.value;

  if(pieceValue.length === 0 || priceValue.length === 0) {
    alert('入力欄に空白があると思われます。');
    return;
  }

  let piece  = parseInt(pieceValue) || 1; // 無効な値だと0にしたいが0で割るとやばそうなので1
  let unit   = unitCostCalcUnitSelect.value;
  let price  = parseInt(priceValue) || 0; // 無効な値だと0
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
  return {unit, price: Math.round(price / piece * 100) / 100 + yenDol}; // 0.--まで表示
}

/**
 * 「何個で何円　1個当たり何円」という表の一行を追加するために、tbodyタグの子要素としてtrタグとtdタグを追加する関数
 */
function tableAdd() {
  tableTrAdd.innerText = '';
  detailText.innerText = '';
  goodsNameInput.value = '';
  shopNameInput.value = '';

  for(let i = 0; i < priceData.length; i++) {
    const trElement = document.createElement('tr'); // 追加する一行

    const goodsTd = document.createElement('td');
    goodsTd.innerText = priceData[i].goods;

    const priceElement = document.createElement('td'); // 値段（真ん中）のtd
    const priceStrongTd = document.createElement('strong'); // 太字の「○円」
    priceStrongTd.innerText = priceData[i].priceStrong;
    const unitSpanElement = document.createElement('span'); // 普通の文字の「/個」
    unitSpanElement.innerText = priceData[i].priceSpan;

    const detailBtnTd = document.createElement('td'); // 詳細ボタン
    const detailBtn = document.createElement('button');
    detailBtn.innerText = '詳細';
    detailBtn.setAttribute('class', 'btn btn-info btn-sm'); // bootstrapのinfoのボタンデザインを適用

    const delBtnTd = document.createElement('td'); // 削除ボタン
    const delBtn = document.createElement('button');
    delBtn.innerText = '削除';
    delBtn.setAttribute('class', 'btn btn-danger btn-sm'); // bootstrapのdangerのボタンデザインを適用

    detailBtn.addEventListener('click', () => { // 詳細ボタン
      goodsNameInput.value = '';
      shopNameInput.value = '';
      detailText.innerHTML = priceData[i].goods + 'の商品の情報を編集して保存';
      back.style.display = 'block';
      detailArea.style.transform = 'translate(-50%, 0)';
    }, false);

    priceElement.appendChild(priceStrongTd); // 「○円」
    priceElement.appendChild(unitSpanElement); // 「/個」
    detailBtnTd.appendChild(detailBtn); // 詳細のtd
    delBtnTd.appendChild(delBtn); // 削除のtd

    trElement.appendChild(goodsTd); // 商品のtdと
    trElement.appendChild(priceElement); // 値段のtdと
    trElement.appendChild(detailBtnTd); // 詳細のtdと
    trElement.appendChild(delBtnTd); // 削除のtdを trに追加する
    tableTrAdd.insertBefore(trElement, tableTrAdd.firstChild); // trをtbodyに追加する

    delBtn.addEventListener('click', () => { // 削除ボタン
      if(confirm('このデータを削除するよ。\nダメだったらキャンセルを押して、\n良かったらOKを押してね。')) {
        deletePriceData(i);
      } else {
        return;
      }
    }, false);


    closeBtn.addEventListener('click', () => { // 閉じるボタン
      back.style.display = 'none';
      detailArea.style.transform = 'translate(0, -1000%)';
      goodsNameInput.value = '';
      shopNameInput.value = '';
    }, false);

    saveBtn.addEventListener('click', () => { // 保存ボタン
      if(!downloadOk) {
        return;
      }

      if(goodsNameInput.value === '' || shopNameInput.value === '') {
        alert('保存入力欄に空白があると思われます。');
        return;
      }

      const today = new Date();
      const month = today.getMonth() + 1; // 月は0から数えてしまうので1を足す
      const day = today.getDate();
      const dayofweek = today.getDay();

      const dayname = ['日', '月', '火', '水', '木', '金', '土'];
      const result = (`${month}月${day}日(${dayname[dayofweek]})`);

      const blob = new Blob([`${result}、${shopNameInput.value}にあった「${goodsNameInput.value}」は、${priceData[i].priceStrong + priceData[i].priceSpan}です。`], { type: 'text/plain' });

      const aTag = document.createElement('a');
      aTag.setAttribute('href', URL.createObjectURL(blob));
      aTag.setAttribute('download', (goodsNameInput.value || 'unit-price-calc') + '.txt');
      aTag.setAttribute('target', '_blank');
      aTag.click(); // ここでダウンロードされる

      back.style.display = 'none';
      detailArea.style.transform = 'translate(0, -1000%)';
      goodsNameInput.value = '';
      shopNameInput.value = '';

      alert('保存が完了しました。');
      downloadOk = false;
    }, false);
    goodsNameInput.oninput = () => downloadOk = true;
    shopNameInput.oninput = () => downloadOk = true;
  }
}

function tableDisplayCheck() { // データが無ければ表は表示しない
  if(tableTrAdd.childElementCount) {
    tableDisplay.style.display = 'block';
    allDelBtn.style.display = 'block';
  } else {
    tableDisplay.style.display = 'none';
    allDelBtn.style.display = 'none';
  }
}

function deletePriceData(priceDataIndex) {
  priceData.splice(priceDataIndex, 1);
  tableAdd();
  tableDisplayCheck();
}

allDelBtn.addEventListener('click', () => {
  if(confirm('要るものは保存した？\n全部消えちゃうよ。')) {
    priceData = [];
    tableTrAdd.innerText = '';
    detailText.innerText = '';
    goodsNameInput.value = '';
    shopNameInput.value = '';
    tableDisplayCheck();
  } else return;
}, false)

window.addEventListener('beforeunload', function(e) { // ページ移動時のダイアログ
  if(priceData.length !== 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});
