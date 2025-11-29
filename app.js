/* app.js
 - records persisted in localStorage under "dr_records"
 - each record: {id, date, type: "thai"|"ri", cat: "A"|"B"|"C", qty}
*/

const LS_KEY = "dr_records";

let records = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
let currentType = null;
let currentCat = null;
let inputValue = ""; // string for display

// elements
const dateInput = document.getElementById("dateInput");
const datePill = document.getElementById("datePill");
const typeBtns = document.querySelectorAll(".type-btn");
const catBtns = document.querySelectorAll(".cat-btn");
const display = document.getElementById("display");
const sumA = document.getElementById("sumA");
const sumB = document.getElementById("sumB");
const sumC = document.getElementById("sumC");
const totalAll = document.getElementById("totalAll");

const hisA = document.getElementById("hisA");
const hisB = document.getElementById("hisB");
const hisC = document.getElementById("hisC");

const btnsNum = document.querySelectorAll(".num");
const btnBack = document.getElementById("btnBack");
const btnEnter = document.getElementById("btnEnter");
const clearAllBtn = document.getElementById("clearAll");
const toggleBtn = document.getElementById("toggleBtn");
const historyBody = document.getElementById("historyBody");

// init date to today
function toLocalISO(d){
  const t = new Date(d.getTime() - d.getTimezoneOffset()*60000);
  return t.toISOString().slice(0,10);
}
dateInput.value = toLocalISO(new Date());
updateDatePill();

// format date pill like "ngày 29 thg 11, 2025"
function formatDateReadable(iso){
  if(!iso) return "";
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString('vi-VN',{month:'short'});
  const year = d.getFullYear();
  return `ngày ${day} ${month} ${year}`;
}
function updateDatePill(){
  datePill.textContent = formatDateReadable(dateInput.value);
}

// date change handler
dateInput.addEventListener("change", () => {
  updateDatePill();
});

// TYPE buttons
typeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    typeBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    // reset display placeholder text style if no input
    if(!inputValue) display.classList.remove("has-value");
    renderSummary();
    renderHistory();
  });
});

// CAT buttons
catBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    catBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    currentCat = btn.dataset.cat;
  });
});

// numbers press
btnsNum.forEach(b=>{
  b.addEventListener("click", ()=>{
    // require selections
    if(!currentType || !currentCat){
      alert("Vui lòng chọn THÁI/RI và A/B/C trước khi nhập.");
      return;
    }
    // append digit (prevent leading zeros if desired)
    inputValue = inputValue === "0" ? b.textContent : inputValue + b.textContent;
    updateDisplay();
  });
});

// backspace
btnBack.addEventListener("click", ()=>{
  if(inputValue.length>0){
    inputValue = inputValue.slice(0,-1);
    updateDisplay();
  }
});

// enter: save record
btnEnter.addEventListener("click", ()=>{
  if(!currentType || !currentCat){
    alert("Vui lòng chọn THÁI/RI và A/B/C trước khi nhập.");
    return;
  }
  if(!inputValue) return;
  const rec = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
    date: dateInput.value || toLocalISO(new Date()),
    type: currentType,
    cat: currentCat,
    qty: Number(inputValue)
  };
  records.push(rec);
  saveRecords();
  inputValue = "";
  updateDisplay();
  renderSummary();
  renderHistory();
});

// update display
function updateDisplay(){
  if(!inputValue){
    display.textContent = "SỐ LƯỢNG";
    display.style.color = "#cfcfcf";
    display.classList.remove("has-value");
  } else {
    display.textContent = inputValue;
    display.style.color = "#111";
    display.classList.add("has-value");
  }
}

// summary by currentType
function renderSummary(){
  let A=0,B=0,C=0;
  if(!currentType){
    sumA.textContent = 0; sumB.textContent = 0; sumC.textContent = 0; totalAll.textContent = 0;
    return;
  }
  records.forEach(r=>{
    if(r.type === currentType){
      if(r.cat === "A") A += r.qty;
      if(r.cat === "B") B += r.qty;
      if(r.cat === "C") C += r.qty;
    }
  });
  sumA.textContent = A;
  sumB.textContent = B;
  sumC.textContent = C;
  totalAll.textContent = A + B + C;
}

// render history (only for currentType)
function renderHistory(){
  hisA.innerHTML = ""; hisB.innerHTML = ""; hisC.innerHTML = "";
  if(!currentType) return;
  // show latest first
  const filtered = records.filter(r => r.type === currentType).slice().reverse();
  filtered.forEach(r=>{
    const li = document.createElement("li");
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${formatDateReadable(r.date)} `;
    const qty = document.createElement("strong");
    qty.textContent = `${r.qty}`;
    qty.style.marginRight = "8px";

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "X";
    del.title = "Xoá";
    del.addEventListener("click", ()=>{
      // delete this record by id
      records = records.filter(x => x.id !== r.id);
      saveRecords();
      renderSummary();
      renderHistory();
    });

    li.appendChild(qty);
    li.appendChild(meta);
    li.appendChild(del);

    if(r.cat === "A") hisA.appendChild(li);
    if(r.cat === "B") hisB.appendChild(li);
    if(r.cat === "C") hisC.appendChild(li);
  });
}

// save to localStorage
function saveRecords(){
  localStorage.setItem(LS_KEY, JSON.stringify(records));
}

// clear all
clearAllBtn.addEventListener("click", ()=>{
  if(confirm("Xoá toàn bộ dữ liệu?")) {
    records = [];
    saveRecords();
    renderSummary();
    renderHistory();
  }
});

// toggle history visible/hidden
toggleBtn.addEventListener("click", ()=>{
  if(historyBody.classList.contains("hidden")){
    historyBody.classList.remove("hidden");
    toggleBtn.textContent = "ẨN";
  } else {
    historyBody.classList.add("hidden");
    toggleBtn.textContent = "HIỆN";
  }
});

// click date pill to open native date picker
datePill.addEventListener("click", ()=>{
  dateInput.showPicker?.() ?? dateInput.focus();
});

// on load render
updateDisplay();
renderSummary();
renderHistory();
updateDatePill();
