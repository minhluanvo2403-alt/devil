function initApp(){
  let currentType = "THÁI";
  let qty = "";

  const app = document.getElementById("app");
  render();

  function render(){
    app.innerHTML = `
      <h2>📌 Ghi cân sầu riêng</h2>

      <div class="type-select">
        <button id="thai" class="${currentType === "THÁI" ? "active" : ""}">THÁI</button>
        <button id="ri" class="${currentType === "RI" ? "active" : ""}">RI</button>
      </div>

      <div class="label">Số lượng</div>
      <div id="quantity">${qty || "0"}</div>

      <div class="numpad">
        ${[1,2,3,4,5,6,7,8,9,"←",0,"OK"].map(key => `
          <button onclick="window.keypad('${key}')">${key}</button>
        `).join("")}
      </div>

      <button class="save-btn" onclick="save()">💾 Lưu</button>

      <div class="history">
        <h3>Lịch sử</h3>

        <table>
          <tr><th colspan="2">SẦU RIÊNG THÁI</th></tr>
          ${load("THÁI").map(i => `<tr><td>${i.qty}</td><td>${i.time}</td></tr>`).join("")}
        </table>

        <table>
          <tr><th colspan="2">SẦU RIÊNG RI</th></tr>
          ${load("RI").map(i => `<tr><td>${i.qty}</td><td>${i.time}</td></tr>`).join("")}
        </table>

        <div class="total">
          Tổng THÁI: ${sum("THÁI")}  —  Tổng RI: ${sum("RI")}
        </div>
      </div>
    `;

    document.getElementById("thai").onclick = () => { currentType="THÁI"; render(); };
    document.getElementById("ri").onclick = () => { currentType="RI"; render(); };
  }

  window.keypad = key => {
    if(key === "←") qty = qty.slice(0,-1);
    else if(key === "OK") save();
    else qty += key;
    render();
  }

  function save(){
    if(!qty) return;
    const list = load(currentType);
    list.unshift({ qty, time: new Date().toLocaleTimeString() });
    localStorage.setItem(currentType, JSON.stringify(list));
    qty = "";
    render();
  }

  function load(type){
    return JSON.parse(localStorage.getItem(type) || "[]");
  }
  function sum(type){
    return load(type).reduce((t,i) => t + Number(i.qty), 0);
  }
}
