const LS_KEY = "dr_records";
let records = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

let currentType = null;
let currentCat  = null;
let inputValue  = "";

// ELEMENTS
const dateInput = document.getElementById("dateInput");
const datePill  = document.getElementById("datePill");
const typeBtns  = document.querySelectorAll(".type-btn");
const catBtns   = document.querySelectorAll(".cat-btn");
const display   = document.getElementById("display");

const sumA = document.getElementById("sumA");
const sumB = document.getElementById("sumB");
const sumC = document.getElementById("sumC");
const totalAll = document.getElementById("totalAll");

const historyTable = document.getElementById("historyTable");
const historyBody  = document.getElementById("historyBody");
const toggleBtn    = document.getElementById("toggleBtn");
const clearAllBtn  = document.getElementById("clearAll");
const historyDate  = document.getElementById("historyDate");

/* DATE INIT */
function toLocalISO(d){
  const t = new Date(d.getTime() - d.getTimezoneOffset()*60000);
  return t.toISOString().slice(0,10);
}
dateInput.value = toLocalISO(new Date());

function formatDateReadable(iso){
  const d = new Date(iso);
  return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}
datePill.textContent = formatDateReadable(dateInput.value);
historyDate.textContent = formatDateReadable(dateInput.value);

dateInput.addEventListener("change", ()=>{
  datePill.textContent = formatDateReadable(dateInput.value);
  historyDate.textContent = formatDateReadable(dateInput.value);
});

/* TYPE SELECT */
typeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    typeBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    renderSummary();
    renderHistory();
  });
});

/* CAT SELECT */
catBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    catBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    currentCat = btn.dataset.cat;
  });
});

/* KEYPAD INPUT */
document.querySelectorAll(".num").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if(!currentType || !currentCat){
      alert("Vui lòng chọn THÁI/RI và A/B/C trước!");
      return;
    }
    inputValue += btn.textContent;
    updateDisplay();
  });
});

document.getElementById("btnBack").addEventListener("click", ()=>{
  inputValue = inputValue.slice(0,-1);
  updateDisplay();
});

/* ENTER TO SAVE */
document.getElementById("btnEnter").addEventListener("click", ()=>{
  if(!inputValue || !currentType || !currentCat) return;

  const rec = {
    id: Date.now(),
    date: dateInput.value,
    type: currentType,
    cat: currentCat,
    qty: Number(inputValue)
  };

  records.push(rec);
  localStorage.setItem(LS_KEY, JSON.stringify(records));

  inputValue = "";
  updateDisplay();
  renderSummary();
  renderHistory();
});

/* DISPLAY */
function updateDisplay(){
  display.textContent = inputValue || "SỐ LƯỢNG";
  display.style.color = inputValue ? "#111" : "#cfcfcf";
}

/* SUMMARY */
function renderSummary(){
  let A=0,B=0,C=0;

  records.forEach(r=>{
    if(r.type===currentType){
      if(r.cat==="A") A+=r.qty;
      if(r.cat==="B") B+=r.qty;
      if(r.cat==="C") C+=r.qty;
    }
  });

  sumA.textContent = A;
  sumB.textContent = B;
  sumC.textContent = C;
  totalAll.textContent = A+B+C;
}

/* HISTORY: TABLE 3 CỘT */
function renderHistory(){
  historyTable.innerHTML = "";

  const list = records.filter(r=>r.type===currentType).sort((a,b)=>b.id-a.id);

  list.forEach(r=>{
    const row = document.createElement("tr");

    const colA = document.createElement("td");
    const colB = document.createElement("td");
    const colC = document.createElement("td");

    if(r.cat==="A") colA.innerHTML = `${r.qty} <span class="del-btn" onclick="del(${r.id})">X</span>`;
    if(r.cat==="B") colB.innerHTML = `${r.qty} <span class="del-btn" onclick="del(${r.id})">X</span>`;
    if(r.cat==="C") colC.innerHTML = `${r.qty} <span class="del-btn" onclick="del(${r.id})">X</span>`;

    row.appendChild(colA);
    row.appendChild(colB);
    row.appendChild(colC);

    historyTable.appendChild(row);
  });
}

/* DELETE ONE */
function del(id){
  records = records.filter(r=>r.id!==id);
  localStorage.setItem(LS_KEY, JSON.stringify(records));
  renderSummary();
  renderHistory();
}

/* CLEAR ALL */
clearAllBtn.addEventListener("click", ()=>{
  if(confirm("Xoá toàn bộ lịch sử?")){
    records=[];
    localStorage.setItem(LS_KEY, "[]");
    renderSummary();
    renderHistory();
  }
});

/* TOGGLE */
toggleBtn.addEventListener("click", ()=>{
  historyBody.classList.toggle("hidden");
  toggleBtn.textContent = historyBody.classList.contains("hidden") ? "HIỆN" : "ẨN";
});

/* INIT */
updateDisplay();
renderSummary();
renderHistory();
