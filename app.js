let currentType = null;
let currentCat = null;
let inputValue = "";
let records = [];

// chọn THÁI / RI
document.querySelectorAll(".typeBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".typeBtn").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        currentType = btn.dataset.type;
        updateSummary();
        renderHistory();
    });
});

// chọn A B C
document.querySelectorAll(".catBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".catBtn").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        currentCat = btn.dataset.cat;
    });
});

// nhập số
document.querySelectorAll(".num").forEach(btn => {
    btn.addEventListener("click", () => {
        if (!currentType || !currentCat) {
            alert("Chọn loại sầu riêng và loại A/B/C trước!");
            return;
        }
        inputValue += btn.innerText;
        updateDisplay();
    });
});

// xóa
document.getElementById("delete").addEventListener("click", () => {
    inputValue = "";
    updateDisplay();
});

// ENTER
document.getElementById("enter").addEventListener("click", () => {

    if (!currentType || !currentCat) {
        alert("Chọn THÁI/RI và A/B/C trước!");
        return;
    }

    if (inputValue === "") return;

    records.push({
        type: currentType,
        cat: currentCat,
        qty: Number(inputValue)
    });

    inputValue = "";
    updateDisplay();
    updateSummary();
    renderHistory();
});

// cập nhật ô hiển thị
function updateDisplay() {
    document.getElementById("display").innerText = inputValue || "0";
}

// cập nhật tổng
function updateSummary() {
    let A = 0, B = 0, C = 0;

    records.forEach(r => {
        if (r.type === currentType) {
            if (r.cat === "A") A += r.qty;
            if (r.cat === "B") B += r.qty;
            if (r.cat === "C") C += r.qty;
        }
    });

    document.getElementById("sumA").innerText = A;
    document.getElementById("sumB").innerText = B;
    document.getElementById("sumC").innerText = C;
    document.getElementById("totalAll").innerText = A + B + C;
}

// hiển thị lịch sử
function renderHistory() {
    let hisA = document.getElementById("hisA");
    let hisB = document.getElementById("hisB");
    let hisC = document.getElementById("hisC");

    hisA.innerHTML = "";
    hisB.innerHTML = "";
    hisC.innerHTML = "";

    records.forEach(r => {
        if (r.type !== currentType) return;

        let li = document.createElement("li");
        li.innerText = r.qty;

        if (r.cat === "A") hisA.appendChild(li);
        if (r.cat === "B") hisB.appendChild(li);
        if (r.cat === "C") hisC.appendChild(li);
    });
}

// ẩn/hiện lịch sử
document.getElementById("historyTitle").addEventListener("click", () => {
    document.getElementById("historyBox").classList.toggle("hidden");
});
