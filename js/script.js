const createCassetsForm = (num) => (
  `<fieldset class="cassets-form">
    <label for="select" title="100,200,500,1000,2000,5000"> Номинал: </label>
      <select id="nominalValue${num}" name="select">
        <option value="100"> 100 </option>
        <option value="200"> 200 </option>
        <option value="500"> 500 </option>
        <option value="1000"> 1000 </option>
        <option value="2000"> 2000 </option>
        <option value="5000"> 5000 </option>
      </select>
    <label>
      Число купюр:
      <input class="nominal-count" id="nominalCount${num}" onkeypress="validate(event)" type="text">
    </label>
    <label>
      Статус:
      <input class="cassets-status" id="isActive${num}" type="checkbox">
    </label>
   </fieldset>`
)

function validate(e) {
    let theEvent = e || window.event;

    if (theEvent.type === 'paste') {
        key = event.clipboardData.getData('text/plain');
    } else {
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }
    let regex = /[0-9]/;
    if( !regex.test(key) ) {
      theEvent.returnValue = false;
      if(theEvent.preventDefault) theEvent.preventDefault();
    }
  }

const cassetCount = document.getElementById('cassettes-input')
const cassetList = document.querySelector(`.cassetes-container`);
const invalide = document.querySelector('.invalide-block');
const resultBlock = document.querySelector('.result-block');
const timeBlock = document.querySelector('.time-block');
const invalideCassetsBlock = document.querySelector('.invalide-cassets-block');
const amountInput = document.getElementById('amount');

let countActiveCassets = 0;

let CASSETS_COUNT = 0;

const render = (container, form, place) => {
     container.insertAdjacentHTML(place, form);
};

let addCassetsForm = () => {
  CASSETS_COUNT = cassetCount.value;

  if(CASSETS_COUNT < 1 || CASSETS_COUNT > 8 || !CASSETS_COUNT) {
    invalide.style.display = "flex";
    cassetCount.value = '';
  } else {
        cassetCount.disabled = true;
        invalide.style.display = "none";
        for (let i = 0; i < CASSETS_COUNT; i++) {
            new Array(CASSETS_COUNT)
                .fill(``)
                .forEach(
                    () => render(cassetList, createCassetsForm(i), `afterbegin`)
                );
        };
    }
};


cassetCount.addEventListener('change', addCassetsForm);

const btnCount = document.querySelector('.btn-count');
const btnState = document.querySelector('.btn-state');
btnState.disabled = true;
let invalideCassets = [];

let limits = {push: function push(el){
   [].push.call(this,el)}
 };


let addCassetsNominal = (num) => {

    var nominalValue = document.querySelector('#nominalValue' + num);
    var nominalCount = document.querySelector('#nominalCount' + num);
    var isActive = document.querySelector('#isActive' + num);

    let limitsValue = nominalValue.value;
    let limitsCount = nominalCount.value;
    let limitsActive = false;

    if (isActive.checked) {
        countActiveCassets += 1;
        limitsActive = true;
        if (isActive && (limitsCount !== undefined) && (limitsValue !== undefined)) {
            limits.push({ "value": limitsValue, "count": limitsCount});
        }
    } else {
      invalideCassets.push(nominalValue.value);
    }

};


let giveMoney = (limites, amount, limitIndex = 0) => {

    if (amount === 0){
        return [];
    }

    if (limitIndex >= limites.length){
        return null;
    }

    let limit = limites[limitIndex];
    limitIndex = limitIndex + 1;
    money = Math.min(parseInt(amount / limit.value), limit.count);

    for (let count = money; count > -1; count--){
        change = giveMoney(limites, amount - limit.value * count, limitIndex);
        if (change !== null){
            if (count){
                change.push({"value": limit.value, "count": count});
                return change;
            }
            return change;
        }
    }
}

let printResult = (amount) => {

    let sum = 0;
    for (let i = 0; i < limits.length; i++){
        let{value,count} = limits[i];
        sum += value * count;
    }

    resultBlock.style.display = "flex";

    if (amount <= sum){
        if (amount % limits[limits.length-1].value === 0){
            result = giveMoney(limits, amount);
            if (result !== undefined){
                resultBlock.innerHTML = `На сумму ${amount} банкомат может выдать: <br>`;
                for (let i = 0; i < result.length; i++){
                    let{value,count} = result[i];
                    resultBlock.innerHTML += `${count} купюр по ${value} рублей<br>`;
                    resultBlock.style.backgroundColor="#32CD32";
                }
            } else {
                resultBlock.innerHTML = "Невозможно поменять деньги";
            }
        } else {
            resultBlock.innerHTML = `Должно быть кратно ${limits[limits.length - 1].value}`;


        }
    }
    else {
      resultBlock.innerHTML = "В банкомате недостаточно средств";
    }
    amountInput.value = '';
};


let doCount = () => {

    let temp_keys = [];
    let temp_count = [];
    let temp_map = [];

    for (i = 0; i < limits.length; i++) {

        if (temp_keys.includes(limits[i].value)){
            let index = temp_keys.indexOf(limits[i].value)
            temp_map[index] = {"value": limits[i].value, "count": parseInt(limits[i].count) + parseInt(temp_count[index])};
            temp_count[index] = parseInt(limits[i].count) + parseInt(temp_count[index]);

        } else {
            temp_keys.push(limits[i].value);
            temp_count.push(limits[i].count);
            temp_map.push({"value": limits[i].value, "count": limits[i].count});
        }
    }

    Array.prototype.sort_by = function(key_func, reverse=false){
        return this.sort( (a, b) => ( key_func(b) - key_func(a) ) * (reverse ? 1 : -1) )
    }

    temp_map.sort_by(el => el.value, reverse=true);
    limits = temp_map;

    var amount = cassetList.querySelector('#amount').value;

        if (limits.length > 0 && (amount !== '')){
            var t0 = performance.now();
            printResult(amount);
            var t1 = performance.now();
            timeBlock.style.display = "flex";
            timeBlock.innerHTML = `Было затрачено ${t1 - t0} мс`
        }
};

let doCountCassets = () => {
    let cassetsListElement = document.querySelectorAll('.cassets-form');
    for (let i = 0; i < cassetsListElement.length; i++) {
        cassetsListElement[i].disabled = true;
        addCassetsNominal(i);
    }
    btnState.disabled = false;
    if (countActiveCassets === 0) {
      resultBlock.style.display = "flex";
      resultBlock.innerHTML = "Извините, все кассеты сломаны";
      btnState.disabled = true;
    }
    doCount();
};

let checkState = () => {
  invalideCassetsBlock.style.display = "flex";
  if (invalideCassets.length) {
    invalideCassetsBlock.innerHTML = `Не работают кассеты: <br>`;
    invalideCassets.forEach((el) => {
      invalideCassetsBlock.innerHTML += `Кассета с номиналом: ${el}р. <br>`;
    })
} else {
  invalideCassetsBlock.style.backgroundColor="#32CD32";
  invalideCassetsBlock.innerHTML = "Все кассеты исправны";
}
};

btnCount.addEventListener('click', doCountCassets);
btnState.addEventListener('click', checkState);
