let currentType = null; 
let currentCat = null;
let inputValue = "";
let data = JSON.parse(localStorage.getItem("records") || "[]");

// --- NÚT CHỌN THÁI / RI ---
document.querySelectorAll(".typeBtn").forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelectorAll(".typeBtn")
            .forEach(x => x.classList.remove("active"));

        btn.classList.add("active");
        currentType = btn.dataset.type;

        calcTotals();
    });
});

// --- NÚT CHỌN A / B / C ---
document.querySelectorAll(".catBtn").forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelectorAll(".catBtn")
            .forEach(x => x.classList.remove("active"));

        btn.classList.add("active");
        currentCat = btn.dataset.cat;
    });
});

// --- PHÍM SỐ ---
document.querySelectorAll(".num").forEach(btn => {
    btn.addEventListener("click", () => {
        inputValue += btn.innerText;
        updateDisplay();
    });
});

// --- XÓA ---
document.getElementById("delete").addEventListener("click", () => {
    inputValue = "";
    updateDisplay();
});

// --- ENTER ---
document.getElementById("enter").addEventListener("click", () => {

    if (!currentType) {
        alert("Vui lòng chọn: THÁI hoặc RI");
        return;
    }

    if (!currentCat) {
        alert("Vui lòng chọn loại: A / B / C");
        return;
    }

    if (inputValue === "") return;

    let record = {
        date: document.getElementById("dateInput").value,
        type: currentType,
        cat: currentCat,
        qty: Number(inputValue)
    };

    data.push(record);
    saveData();
    renderHistory();
    calcTotals();

    inputValue = "";
    updateDisplay();
});

// --- LƯU ---
function saveData() {
    localStorage.setItem("records", JSON.stringify(data));
}

// --- HIỂN THỊ SỐ ĐANG NHẬP ---
function updateDisplay() {
    document.getElementById("display").innerText = inputValue || "0";
}

// --- TÍNH TỔNG THEO LOẠI ĐANG CHỌN (THÁI HOẶC RI) ---
function calcTotals() {
    if (!currentType) return;

    let A = 0, B = 0, C = 0;

    data.forEach(r => {
        if (r.type === currentType) {
            if (r.cat === "A") A += r.qty;
            if (r.cat === "B") B += r.qty;
            if (r.cat === "C") C += r.qty;
        }
    });

    document.getElementById("totalA").innerText = A;
    document.getElementById("totalB").innerText = B;
    document.getElementById("totalC").innerText = C;

    document.getElementById("grandTotal").innerText = A + B + C;
}

// --- HIỂN THỊ LỊCH SỬ ---
function renderHistory() {
    let tbody = document.querySelector("#historyTable tbody");
    tbody.innerHTML = "";

    data.forEach((r, i) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.type.toUpperCase()} - ${r.cat}</td>
            <td>${r.qty}</td>
            <td><button data-i="${i}" class="delRow">X</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll(".delRow").forEach(btn => {
        btn.addEventListener("click", () => {
            data.splice(btn.dataset.i, 1);
            saveData();
            renderHistory();
            calcTotals();
        });
    });
}

// --- XÓA DỮ LIỆU ---
document.getElementById("clearAll").addEventListener("click", () => {
    if (confirm("Xoá toàn bộ dữ liệu?")) {
        data = [];
        saveData();
        renderHistory();
        calcTotals();
    }
});

renderHistory();
calcTotals();
