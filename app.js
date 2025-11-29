function initApp() {
  const KEY = "ghi_sau_rieng_v15";

  const ngayEl = document.getElementById("ngay");
  const loaiSREl = document.getElementById("loaiSR");
  const displayEl = document.getElementById("displaySL");

  const thaiTable = document.getElementById("thai-history");
  const riTable = document.getElementById("ri-history");

  const btnXoaTat = document.getElementById("xoaTat");

  // Set ngày mặc định
  ngayEl.value = new Date().toISOString().split("T")[0];

  let hang = null;
  let soLuong = "";

  function load() { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  function formatNum(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Chọn A/B/C
  document.querySelectorAll(".hang-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".hang-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      hang = btn.dataset.h;
    };
  });

  // Numpad
  document.querySelectorAll(".num-btn").forEach(btn => {
    btn.onclick = () => {
      const v = btn.textContent;

      if (btn.id === "del") {
        soLuong = soLuong.slice(0, -1);
      }
      else if (btn.id === "enter") {
        submitData();
      }
      else {
        if (soLuong.length < 6) soLuong += v;
      }

      displayEl.value = soLuong ? formatNum(soLuong) : "";
    };
  });

  // Submit vào lịch sử
  function submitData() {
    if (!hang) return alert("Chọn loại hàng");
    if (!soLuong) return alert("Nhập số lượng");

    const data = load();

    data.push({
      date: ngayEl.value,
      loaiSR: loaiSREl.value,
      hang: hang,
      soLuong: Number(soLuong),
      time: new Date().toLocaleTimeString("vi-VN")
    });

    save(data);

    soLuong = "";
    displayEl.value = "";
    render();
  }

  // Xóa tất cả
  btnXoaTat.onclick = () => {
    if (confirm("Xóa toàn bộ dữ liệu?")) {
      localStorage.removeItem(KEY);
      render();
    }
  };

  // Render
  function render() {
    const data = load();
    const ngay = ngayEl.value;

    // Tổng A/B/C
    let tA = 0, tB = 0, tC = 0;

    data.forEach(item => {
      if (item.date === ngay && item.loaiSR === loaiSREl.value) {
        if (item.hang === "A") tA += item.soLuong;
        if (item.hang === "B") tB += item.soLuong;
        if (item.hang === "C") tC += item.soLuong;
      }
    });

    document.getElementById("tongA").textContent = formatNum(tA);
    document.getElementById("tongB").textContent = formatNum(tB);
    document.getElementById("tongC").textContent = formatNum(tC);
    document.getElementById("tongAll").textContent = formatNum(tA + tB + tC);

    // ====== RENDER LỊCH SỬ THÁI ======
    thaiTable.innerHTML = "";
    data.forEach((item, index) => {
      if (item.loaiSR === "Thai") {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.hang}</td>
          <td>${formatNum(item.soLuong)}</td>
          <td>${item.time}</td>
          <td><button class="delete-btn" data-id="${index}">Xóa</button></td>
        `;
        thaiTable.appendChild(tr);
      }
    });

    // ====== RENDER LỊCH SỬ RI ======
    riTable.innerHTML = "";
    data.forEach((item, index) => {
      if (item.loaiSR === "Ri") {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.hang}</td>
          <td>${formatNum(item.soLuong)}</td>
          <td>${item.time}</td>
          <td><button class="delete-btn" data-id="${index}">Xóa</button></td>
        `;
        riTable.appendChild(tr);
      }
    });

    // Xóa từng dòng
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        if (confirm("Xóa mục này?")) {
          const data = load();
          data.splice(id, 1);
          save(data);
          render();
        }
      };
    });
  }

  ngayEl.onchange = render;
  loaiSREl.onchange = render;

  render();
}
