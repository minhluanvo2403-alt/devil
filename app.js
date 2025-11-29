/* =========================================
        CHẶN SAFARI - CHỈ CHẠY PWA
   ========================================= */
if (!window.matchMedia('(display-mode: standalone)').matches &&
    !navigator.standalone) {
    document.body.innerHTML = `
        <div style="padding:20px; font-size:22px; text-align:center;">
            Ứng dụng chỉ hoạt động khi được thêm vào Màn hình chính.<br><br>
            → <b>Cảm ơn</b> đã quan tâm.
        </div>
    `;
}

/* =========================================
                 MẬT KHẨU
   ========================================= */

const APP_PASSWORD = "minhluan";

const pwScreen   = document.getElementById("passwordScreen");
const pwInput    = document.getElementById("pwInput");
const pwLoginBtn = document.getElementById("pwLoginBtn");

// Nếu chưa xác nhận lần đầu → yêu cầu nhập 1 lần
if (!localStorage.getItem("auth_ok")) {
    pwScreen.classList.remove("hidden");
}

pwLoginBtn.addEventListener("click", ()=>{
    if (pwInput.value.trim() === APP_PASSWORD) {
        localStorage.setItem("auth_ok", "1");
        pwScreen.classList.add("hidden");
    } else {
        alert("Sai mật khẩu!");
    }
});


/* =========================================
                GHI SỐ - CHÍNH
   ========================================= */

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


/* FORMAT */
function fmt(n){
  return n.toLocaleString('vi-VN');
}


/* NGÀY */
function toLocalISO(d){
  return new Date(d.getTime() - d.getTimezoneOffset()*60000)
        .toISOString().slice(0,10);
}

dateInput.value = toLocalISO(new Date());

function fDate(d){
  d = new Date(d);
  return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

datePill.textContent = fDate(dateInput.value);
historyDate.textContent = fDate(dateInput.value);

dateInput.addEventListener("change", ()=>{
  datePill.textContent = fDate(dateInput.value);
  historyDate.textContent = fDate(dateInput.value);
});


/* LOẠI */
typeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    typeBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");

    currentType = btn.dataset.type;

    renderSummary();
    renderHistory();
  });
});


/* A/B/C */
catBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    catBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");

    currentCat = btn.dataset.cat;
  });
});


/* KEYPAD */
document.querySelectorAll(".num").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if(!currentType || !currentCat){
      alert("Vui lòng chọn THÁI/RI và A/B/C!");
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


/* ENTER LƯU */
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
  if(!inputValue){
    display.textContent = "SỐ LƯỢNG";
    display.style.color = "#cfcfcf";
  } else {
    display.textContent = fmt(Number(inputValue));
    display.style.color = "#111";
  }
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

  sumA.textContent = fmt(A);
  sumB.textContent = fmt(B);
  sumC.textContent = fmt(C);
  totalAll.textContent = fmt(A+B+C);
}


/* LỊCH SỬ */
function deleteRecord(id){
  records = records.filter(r => r.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(records));
  renderSummary();
  renderHistory();
}


function renderHistory(){
  historyTable.innerHTML = "";

  if(!currentType) return;

  const list = records
    .filter(r => r.type === currentType)
    .sort((a,b)=>b.id-a.id);

  list.forEach(r=>{

    const row = document.createElement("tr");

    const colA = document.createElement("td");
    const colB = document.createElement("td");
    const colC = document.createElement("td");

    function mkDelBtn(){
      const x = document.createElement("span");
      x.className = "del-btn";
      x.textContent = "X";
      x.addEventListener("click",()=>deleteRecord(r.id));
      return x;
    }

    if(r.cat==="A"){
      colA.textContent = fmt(r.qty);
      colA.appendChild(mkDelBtn());
    }
    if(r.cat==="B"){
      colB.textContent = fmt(r.qty);
      colB.appendChild(mkDelBtn());
    }
    if(r.cat==="C"){
      colC.textContent = fmt(r.qty);
      colC.appendChild(mkDelBtn());
    }

    row.appendChild(colA);
    row.appendChild(colB);
    row.appendChild(colC);

    historyTable.appendChild(row);
  });
}


/* CLEAR ALL */
clearAllBtn.addEventListener("click", ()=>{
  if(confirm("Xoá toàn bộ dữ liệu?")){
    records = [];
    localStorage.setItem(LS_KEY, "[]");
    renderSummary();
    renderHistory();
  }
});


/* SHOW / HIDE HISTORY */
toggleBtn.addEventListener("click", ()=>{
  historyBody.classList.toggle("hidden");
  toggleBtn.textContent =
    historyBody.classList.contains("hidden") ? "HIỆN" : "ẨN";
});


/* INIT */
updateDisplay();
renderSummary();
renderHistory();
