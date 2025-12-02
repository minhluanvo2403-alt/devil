/* ========== CONFIG ========== */
/* Thay đổi tại đây nếu cần */
const CLIENT_ID = '453269425858-vnarg0t35tjcg4m5487a1u0uunu6578l.apps.googleusercontent.com';
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file' // để app có thể tạo/ghi file do user ủy quyền
].join(' ');
const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];

// Nếu bạn muốn ghi thẳng vào file spreadsheet có sẵn (theo link bạn gửi), đặt ID ở đây:
const SPREADSHEET_ID = '1P-7ddrPdNPBYo-Ir6QDk46IFwqYTM-YP-CYu32d4J9Y';

/* ========== GAPI / AUTH ========== */
let GoogleAuth;
let isSignedIn = false;

function gapiLoaded() {
  gapi.load('client:auth2', initClient);
}

async function initClient() {
  await gapi.client.init({
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  });
  GoogleAuth = gapi.auth2.getAuthInstance();
  GoogleAuth.isSignedIn.listen(updateSigninStatus);
  updateSigninStatus(GoogleAuth.isSignedIn.get());
  document.getElementById('signinBtn').addEventListener('click', ()=>GoogleAuth.signIn());
  document.getElementById('signoutBtn').addEventListener('click', ()=>GoogleAuth.signOut());
}

function updateSigninStatus(signedIn) {
  isSignedIn = signedIn;
  document.getElementById('signinBtn').style.display = signedIn ? 'none' : '';
  document.getElementById('signoutBtn').style.display = signedIn ? '' : 'none';
  document.getElementById('authStatus').textContent = signedIn ? 'Đã kết nối' : 'Chưa kết nối';
  // Khi đổi trạng thái, cập nhật lại (nếu cần)
}

/* Khi gapi script load xong sẽ gọi gapiLoaded */
window.addEventListener('load', ()=> {
  // gapi loaded by <script src="https://apis.google.com/js/api.js" defer></script>
  if (window.gapi) {
    gapiLoaded();
  } else {
    console.error('gapi not loaded');
  }
});

/* ========== ỨNG DỤNG GHI SỐ (logic) ========== */

const LS_KEY = "sr_records_v2";
let records = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

let currentType = null;
let currentCat  = null;
let inputValue  = "";

/* ELEMENTS */
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

function fmt(n){ return n.toLocaleString('vi-VN'); }

/* DATE: không tự động cập nhật qua ngày mới
   - Lấy last saved date từ localStorage nếu có, nếu không thì ngày hôm nay (chỉ 1 lần khi lần đầu load)
*/
function toLocalISO(d){
  return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
}
const savedDate = localStorage.getItem('sr_last_date');
dateInput.value = savedDate || toLocalISO(new Date());
function fDate(d){
  d = new Date(d);
  return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}
datePill.textContent = fDate(dateInput.value);
historyDate.textContent = fDate(dateInput.value);

// khi user đổi ngày -> lưu lại nhưng không tự đổi khi ngày qua
dateInput.addEventListener("change", ()=>{
  localStorage.setItem('sr_last_date', dateInput.value);
  datePill.textContent = fDate(dateInput.value);
  historyDate.textContent = fDate(dateInput.value);
  renderSummary();
  renderHistory();
});

/* TYPE (THÁI / RI) */
typeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    typeBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    renderSummary();
    renderHistory();
  });
});

/* CAT (A/B/C) */
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
document.getElementById("btnEnter").addEventListener("click", async ()=>{
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

  // GỌI HÀM ĐỒNG BỘ LÊN GOOGLE SHEETS (nếu đã đăng nhập)
  try {
    if (isSignedIn) {
      await syncDayToSheet(dateInput.value);
      console.log('Đã sync lên Google Sheets cho', dateInput.value);
    } else {
      console.log('Chưa đăng nhập Google — dữ liệu lưu cục bộ');
    }
  } catch (err) {
    console.error('Sync error', err);
    alert('Lỗi khi đồng bộ lên Google Sheets: ' + (err.message || err));
  }
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
    if(r.type===currentType && r.date===dateInput.value){
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

/* DELETE with confirmation */
function deleteRecord(id){
  if(!confirm('Bạn có chắc muốn xoá mục này?')) return;
  records = records.filter(r => r.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(records));
  renderSummary();
  renderHistory();
  // after deletion, optionally re-sync day
  if (isSignedIn) {
    syncDayToSheet(dateInput.value).catch(err=>console.error('sync after del failed',err));
  }
}

/* HISTORY render (3 columns) */
function renderHistory(){
  historyTable.innerHTML = "";
  if (!currentType) return;

  const list = records
    .filter(r => r.type === currentType && r.date === dateInput.value)
    .sort((a,b)=>b.id - a.id);

  const colA = list.filter(r => r.cat === "A");
  const colB = list.filter(r => r.cat === "B");
  const colC = list.filter(r => r.cat === "C");

  const maxRows = Math.max(colA.length, colB.length, colC.length);
  for (let i=0;i<maxRows;i++){
    const row = document.createElement('tr');

    const tdA = document.createElement('td');
    if(colA[i]){
      tdA.textContent = fmt(colA[i].qty);
      const del = document.createElement('span');
      del.textContent = " X";
      del.className = "del-btn";
      del.onclick = ()=> deleteRecord(colA[i].id);
      tdA.appendChild(del);
    }

    const tdB = document.createElement('td');
    if(colB[i]){
      tdB.textContent = fmt(colB[i].qty);
      const del = document.createElement('span');
      del.textContent = " X";
      del.className = "del-btn";
      del.onclick = ()=> deleteRecord(colB[i].id);
      tdB.appendChild(del);
    }

    const tdC = document.createElement('td');
    if(colC[i]){
      tdC.textContent = fmt(colC[i].qty);
      const del = document.createElement('span');
      del.textContent = " X";
      del.className = "del-btn";
      del.onclick = ()=> deleteRecord(colC[i].id);
      tdC.appendChild(del);
    }

    row.appendChild(tdA);
    row.appendChild(tdB);
    row.appendChild(tdC);
    historyTable.appendChild(row);
  }
}

/* CLEAR ALL FOR DATE */
clearAllBtn.addEventListener('click', ()=>{
  if(confirm('Xoá toàn bộ dữ liệu của ngày này?')){
    records = records.filter(r => r.date !== dateInput.value);
    localStorage.setItem(LS_KEY, JSON.stringify(records));
    renderSummary();
    renderHistory();
    if (isSignedIn) syncDayToSheet(dateInput.value).catch(e=>console.error(e));
  }
});

/* SHOW/HIDE HISTORY */
toggleBtn.addEventListener('click', ()=>{
  historyBody.classList.toggle('hidden');
  toggleBtn.textContent = historyBody.classList.contains('hidden') ? 'HIỆN' : 'ẨN';
});

/* INIT UI state */
updateDisplay();
renderSummary();
renderHistory();

/* ========== GOOGLE SHEETS SYNC FUNCTIONS ========== */

/*
  Logic:
  - Tính tổng A/B/C cho THÁI và RI của ngày (date)
  - Kiểm tra sheet (tab) có tên yyyy-mm-dd trong SPREADSHEET_ID
  - Nếu chưa có -> tạo sheet (batchUpdate addSheet)
  - Viết dữ liệu vào range của sheet ở layout giống mẫu:
      Row 1: (header) Ngày tháng | Loại Sầu riêng | A | B | C | Tổng cộng
      Row 2: (THÁI) Số lượng
      Row 3: (RI)   Số lượng
*/

async function syncDayToSheet(dateStr) {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID không được cấu hình.');
  // tính tổng
  const totals = {
    thai: {A:0,B:0,C:0},
    ri:   {A:0,B:0,C:0}
  };
  records.forEach(r=>{
    if (r.date !== dateStr) return;
    if (r.type === 'thai') totals.thai[r.cat] += r.qty;
    if (r.type === 'ri')   totals.ri[r.cat] += r.qty;
  });

  const sheetTitle = dateStr; // yyyy-mm-dd

  // 1) lấy metadata spreadsheet
  const metaResp = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties(sheetId,title)'
  });
  const sheets = metaResp.result.sheets || [];
  const found = sheets.find(s=>s.properties.title === sheetTitle);

  if (!found) {
    // tạo sheet
    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [
          { addSheet: { properties: { title: sheetTitle } } }
        ]
      }
    });
  }

  // chuẩn bị data viết (2D array)
  const header = ['Ngày tháng','Loại Sầu riêng','A','B','C','Tổng cộng'];
  const thaiRow = [dateStr,'Thái', totals.thai.A, totals.thai.B, totals.thai.C, totals.thai.A+totals.thai.B+totals.thai.C];
  const riRow   = [dateStr,'Ri',   totals.ri.A,   totals.ri.B,   totals.ri.C,   totals.ri.A+totals.ri.B+totals.ri.C];

  const values = [header, thaiRow, riRow];

  // 3) Viết vào range 'SheetTitle'!A1:F3 (overwrite)
  await gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetTitle}!A1:F3`,
    valueInputOption: 'USER_ENTERED',
    resource: { values }
  });

  // Optionally set column widths / format - omitted for simplicity
  return true;
}
