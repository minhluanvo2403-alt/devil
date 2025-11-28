function initApp(){
  document.getElementById("app").innerHTML = `
    <h1>Ghi cân sầu riêng</h1>

    <label>Loại sầu riêng:</label>
    <select id="loai">
      <option value="thai">Thái</option>
      <option value="ri">Ri</option>
    </select>

    <label>Cân (kg):</label>
    <input type="number" id="kg" inputmode="decimal" />

    <label>Số lượng:</label>
    <input type="number" id="soLuong" />

    <button id="add">Thêm</button>

    <h2>Lịch sử</h2>
    <table id="history">
      <thead>
        <tr><th>Loại</th><th>Cân (kg)</th><th>Số lượng</th></tr>
      </thead>
      <tbody></tbody>
    </table>

    <h2>Tổng</h2>
    <p>Tổng Thái: <span id="total-thai">0</span></p>
    <p>Tổng Ri: <span id="total-ri">0</span></p>
  `;

  const loai = document.getElementById("loai");
  const kg = document.getElementById("kg");
  const soLuong = document.getElementById("soLuong");
  const tbody = document.querySelector("#history tbody");
  const totalT = document.getElementById("total-thai");
  const totalR = document.getElementById("total-ri");

  let total = { thai: 0, ri: 0 };

  document.getElementById("add").addEventListener("click", () => {
    const L = loai.value;
    const K = parseFloat(kg.value) || 0;
    const SL = parseInt(soLuong.value) || 0;

    if (K === 0 || SL === 0) {
      alert("Vui lòng nhập cân và số lượng!");
      return;
    }

    // thêm vào bảng
    tbody.innerHTML += `
      <tr>
        <td>${L === "thai" ? "Thái" : "Ri"}</td>
        <td>${K.toFixed(2)}</td>
        <td>${SL}</td>
      </tr>`;

    // tổng
    total[L] += SL;
    totalT.textContent = total.thai;
    totalR.textContent = total.ri;

    kg.value = "";
    soLuong.value = "";
    kg.focus();
  });
}
