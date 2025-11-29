let selectedType = null;
let selectedGrade = null;

document.querySelectorAll('.select-btn').forEach(btn => {
  
  btn.addEventListener('click', () => {

    if (btn.dataset.type) {
      document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
      selectedType = btn.dataset.type;
    }

    if (btn.dataset.grade) {
      document.querySelectorAll('[data-grade]').forEach(b => b.classList.remove('active'));
      selectedGrade = btn.dataset.grade;
    }

    btn.classList.add('active');
  });

});

document.getElementById("addButton").addEventListener("click", () => {
  const date = document.getElementById("dateInput").value;
  const qty = document.getElementById("quantityInput").value;

  if (!date || !selectedType || !selectedGrade || !qty) {
    alert("Vui lòng chọn ngày, loại sầu riêng, loại A/B/C và số lượng.");
    return;
  }

  addRecord(selectedType, selectedGrade, qty);
  document.getElementById("quantityInput").value = "";
});

let historyData = {
  RI: { A: 0, B: 0, C: 0 },
  THAI: { A: 0, B: 0, C: 0 }
};

function addRecord(type, grade, qty) {
  historyData[type][grade] += Number(qty);
  renderHistory();
}

function renderHistory() {
  const table = document.getElementById("historyTable");
  table.innerHTML = `
    <tr>
      <td>RI</td>
      <td>${historyData.RI.A}</td>
      <td>${historyData.RI.B}</td>
      <td>${historyData.RI.C}</td>
    </tr>
    <tr>
      <td>THÁI</td>
      <td>${historyData.THAI.A}</td>
      <td>${historyData.THAI.B}</td>
      <td>${historyData.THAI.C}</td>
    </tr>
  `;
}

document.getElementById("toggleHistory").addEventListener("click", () => {
  const history = document.getElementById("history");
  const arrow = document.getElementById("arrow");

  history.classList.toggle("hidden");
  arrow.textContent = history.classList.contains("hidden") ? "▼" : "▲";
});
