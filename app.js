const LS_KEY = "dr_records";

let records = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
let currentType = null;
let currentCat = null;
let inputValue = "";

// ELEMENTS
const dateInput = document.getElementById("dateInput");
const datePill  = document.getElementById("datePill");

const typeBtns = document.querySelectorAll(".type-btn");
const catBtns  = document.querySelectorAll(".cat-btn");
const display  = document.getElementById("display");

const sumA = document.getElementById("sumA");
const sumB = document.getElementById("sumB");
const sumC = document.getElementById("sumC");
const totalAll = document.getElementById("totalAll");

const btnBack  = document.getElementById("btnBack");
const btnEnter = document.getElementById("btnEnter");
const numBtns  = document.querySelectorAll(".num");

const clearAllBtn = document.getElementById("clearAll");
const toggleBtn   = document.getElementById("toggleBtn");
const historyBody = document.getElementById("historyBody");
const historyList = document.getElementById("historyList");
const historyDate = document.getElementById("historyDate");

/* ==============================
      XỬ LÝ HIỂN THỊ NGÀY
==============================*/

function toLocalISO(d){
  const t = new Date(d.getTime() - d.getTimezoneOffset()*60000);
  return t.toISOString().slice(0,10);
}

dateInput.value = toLocalISO(new Date());

function formatDateReadable(iso){
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("vi-VN",{month:"short"});
  return `Ngày ${day} ${month}`;
}
function updateDatePill(){ datePill.textContent = formatDateReadable(dateInput.value); }
updateDatePill();

dateInput.addEventListener("change", updateDatePill);

/* ==============================
        CHỌN THÁI / RI
==============================*/

typeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    typeBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    renderSummary();
  });
});

/* ==============================
        CHỌN A / B / C
==============================*/

catBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    catBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    currentCat = btn.dataset.cat;
  });
});

/* ==============================
        NHẬP SỐ
==============================*/

numBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if(!currentType || !currentCat){
      alert("Hãy chọn Thái/Ri và A/B/C trước!");
      return;
    }
    inputValue += btn.textContent;
    updateDisplay();
  });
});

btnBack.addEventListener("click", ()=>{
  inputValue = inputValue.slice(0,-1);
  updateDisplay();
});

/* ==============================
        ENTER = LƯU
==============================*/

btnEnter.addEventListener("click", ()=>{
  if(!currentType || !currentCat || !inputValue) return;

  const rec = {
    id: Date.now(),
    date: dateInput.value,
    type: currentType,
    cat: currentCat,
    qty: Number(inputValue)
  };

  records.push(rec);
  save();

  inputValue = "";
  updateDisplay();
  renderSummary();
  renderHistory();
});

/* ==============================
        UPDATE DISPLAY
==============================*/

function updateDisplay(){
  display.textContent = inputValue || "SỐ LƯỢNG";
  display.style.color = inputValue ? "#111" : "#ccc";
}

/* ==============================
        TÍNH TỔNG
==============================*/

function renderSummary(){
  let A=0,B=0,C=0;

  if(!currentType){
    sumA.textContent = sumB.textContent = sumC.textContent = totalAll.textContent = 0;
    return;
  }

  records.forEach(r=>{
    if(r.type === currentType){
      if(r.cat === "A") A+=r.qty;
      if(r.cat === "B") B+=r.qty;
      if(r.cat === "C") C+=r.qty;
    }
  });

  sumA.textContent = A;
  sumB.textContent = B;
  sumC.textContent = C;
  totalAll.textContent = A+B+C;
}

/* ==============================
        LỊCH SỬ NHÓM THEO NGÀY
==============================*/

function groupBy(array, key){
  return array.reduce((obj, item)=>{
    const k = item[key];
    if(!obj[k]) obj[k] = [];
    obj[k].push(item);
    return obj;
  },{});
}

function renderHistory(){
  historyList.innerHTML = "";

  if(records.length === 0) return;

  const groupsByDay = groupBy(records, "date");
  const sortedDays = Object.keys(groupsByDay).sort().reverse();

  historyDate.textContent = `Tổng số ngày: ${sortedDays.length}`;

  sortedDays.forEach(day => {
    const group = groupsByDay[day];

    const dayBox = document.createElement("div");
    dayBox.className = "group-day";

    const title = document.createElement("div");
    title.className = "group-day-title";
    title.textContent = `${formatDateReadable(day)}`;
    dayBox.appendChild(title);

    const groupsByType = groupBy(group, "type");

    ["thai","ri"].forEach(type=>{
      if(!groupsByType[type]) return;

      const typeBox = document.createElement("div");
      typeBox.className = "group-type";

      const h = document.createElement("div");
      h.className = "group-type-head";
      h.textContent = type.toUpperCase();
      typeBox.appendChild(h);

      const rows = document.createElement("div");
      rows.className = "group-rows";

      ["A","B","C"].forEach(cat=>{
        const items = groupsByType[type].filter(r=>r.cat===cat);
        if(items.length){
          const total = items.reduce((t,x)=>t+x.qty,0);

          const r = document.createElement("div");
          r.className = "group-row";
          r.textContent = `${cat}: ${total}`;
          rows.appendChild(r);
        }
      });

      typeBox.appendChild(rows);
      dayBox.appendChild(typeBox);
    });

    historyList.appendChild(dayBox);
  });
}

/* ==============================
        CLEAR + TOGGLE
==============================*/

function save(){ localStorage.setItem(LS_KEY, JSON.stringify(records)); }

clearAllBtn.addEventListener("click", ()=>{
  if(confirm("Xoá toàn bộ dữ liệu?")){
    records = [];
    save();
    renderSummary();
    renderHistory();
  }
});

toggleBtn.addEventListener("click", ()=>{
  historyBody.classList.toggle("hidden");
  toggleBtn.textContent = historyBody.classList.contains("hidden") ? "HIỆN" : "ẨN";
});

/* INIT */
updateDisplay();
renderSummary();
renderHistory();
