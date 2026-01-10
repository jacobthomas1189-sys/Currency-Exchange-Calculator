/* ===== TAB SWITCH ===== */
currencyTab.onclick = () => {
    currencyTab.classList.add("active");
    usdtTab.classList.remove("active");
    currencySection.style.display="block";
    usdtSection.style.display="none";
};
usdtTab.onclick = () => {
    usdtTab.classList.add("active");
    currencyTab.classList.remove("active");
    usdtSection.style.display="block";
    currencySection.style.display="none";
};
function saveDealToLocalStorage(dealData) {
  const today = new Date().toLocaleDateString();
  const key = `deals_${today}`;

  const existingDeals = JSON.parse(localStorage.getItem(key)) || [];
  existingDeals.push(dealData);

  localStorage.setItem(key, JSON.stringify(existingDeals));
}


/* ===== CURRENCY DEAL LOGIC (UNTOUCHED) ===== */
const cAmount = curAmount;
const cRateUSDT = curRateUSDT;
const cUsdtPKR = curUsdtPKR;
const cClientRate = curClientRate;
const cClientType = curClientType;
const cOutput = currencyOutput;
let lastCurrencyProfit = null;


const saveCurrencyBtn = document.getElementById("saveCurrencyDeal");
const saveUSDTBtn = document.getElementById("saveUSDTDeal");
saveCurrencyBtn.addEventListener("click", () => {

  if (lastCurrencyProfit === null) {
    alert("Please calculate the deal first.");
    return;
  }

  const dealData = {
    dealType: "Currency Deal",
    amount: +cAmount.value,
    clientType: cClientType.value,
    profitValue: lastCurrencyProfit,
    date: new Date().toLocaleDateString()
  };

  saveDealToLocalStorage(dealData);
  showToast();
  console.log("Saved Currency Deal:", dealData);
});




[cAmount, cRateUSDT, cUsdtPKR, cClientRate, cClientType]
.forEach(el => el.addEventListener("input", calculateCurrency));

function calculateCurrency(){
    const amount = +cAmount.value;
    const rateUSDT = +cRateUSDT.value;
    const usdtPKR = +cUsdtPKR.value;
    const clientRate = +cClientRate.value;
    const clientType = cClientType.value;

    if(!amount || !rateUSDT){
    cOutput.innerHTML = "Enter values to see result.";
    saveCurrencyBtn.classList.remove("show");
    return;
}


    const marketUSDT = amount / rateUSDT;
    let html = `<div class="market">Currency → USDT: ${marketUSDT.toFixed(4)}</div>`;

   if(usdtPKR){
    const totalPKR = marketUSDT * usdtPKR;
    const perUnitPKR = totalPKR / amount;

    html += `<div class="market">Currency → PKR: ${perUnitPKR.toFixed(2)}</div>
<div class="market">
  Total PKR:
  <span class="copy-wrap" data-copy="${totalPKR}">
    <span class="copy-value">${totalPKR.toLocaleString()}</span>
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>`;



        if(clientRate && clientType==="PKR"){
            const clientPKR = amount * clientRate;
            const profitPKR = totalPKR - clientPKR;
            lastCurrencyProfit = profitPKR;
            html += `<hr>
<div class="client">
  Client PKR:
  <span class="copy-wrap" data-copy="${clientPKR}">
    <span class="copy-value">${clientPKR.toLocaleString()}</span>
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>
<div class="${profitPKR>=0 ? 'profit' : 'loss'}">
  Your ${profitPKR>=0 ? 'Profit' : 'Loss'}:
  <span class="copy-wrap" data-copy="${profitPKR}">
    <span class="copy-value">${profitPKR.toLocaleString()}</span> PKR
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>`;


        }
    }

    if(clientRate && clientType==="USDT"){
        const clientUSDT = amount / clientRate;
        const profitUSDT = marketUSDT - clientUSDT;
        html += `<hr><div class="client">
  Client USDT:
  <span class="copy-wrap" data-copy="${clientUSDT}">
    <span class="copy-value">${clientUSDT.toFixed(4)}</span>
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>
        <div class="${profitUSDT>=0 ? 'profit' : 'loss'}">
  Your ${profitUSDT>=0 ? 'Profit' : 'Loss'}:
  <span class="copy-wrap" data-copy="${profitUSDT}">
    <span class="copy-value">${profitUSDT.toFixed(4)}</span> USDT
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>`;
    }

    cOutput.innerHTML = html;
    saveCurrencyBtn.classList.add("show");
}

/* ===== USDT DEAL FIXED (SELL & BUY SEPARATE STATE) ===== */
let mode = "SELL";
let lastUSDTProfit = null;
saveUSDTBtn.addEventListener("click", () => {

if (lastUSDTProfit === null) {
  alert("Please calculate the USDT deal first.");
  return;
}

  const dealData = {
    dealType: "USDT Deal",
    mode: mode,                 // BUY ya SELL
    usdtAmount: +usdtAmount.value,
    marketRate: +marketRate.value,
    clientRate: +clientRate.value,
    profitValue: lastUSDTProfit,
    date: new Date().toLocaleDateString()
  };
  saveDealToLocalStorage(dealData);
  showToast();
  console.log("Saved USDT Deal:", dealData);
});

const usdtData = {
    SELL: { u:"", m:"", c:"", type:"PKR" },
    BUY:  { u:"", m:"", c:"", type:"PKR" }
};

sellBtn.onclick = () => {
    mode = "SELL";
    sellBtn.classList.add("active");
    buyBtn.classList.remove("active");
    loadUSDT();
};

buyBtn.onclick = () => {
    mode = "BUY";
    buyBtn.classList.add("active");
    sellBtn.classList.remove("active");
    loadUSDT();
};

[usdtAmount, marketRate, clientRate].forEach(el => {
    el.addEventListener("input", () => {
        usdtData[mode] = {
    u: usdtAmount.value,
    m: marketRate.value,
    c: clientRate.value
};

        calculateUSDT();
    });
});

function loadUSDT(){
    const d = usdtData[mode];
    usdtAmount.value = d.u;
    marketRate.value = d.m;
    clientRate.value = d.c;
    calculateUSDT();
}

function calculateUSDT(){
    const u = +usdtAmount.value;
    const m = +marketRate.value;
    const c = +clientRate.value;
    const type = "PKR";


    if(!u || !m || !c){
        usdtOutput.innerHTML = "Enter values to see result.";
        return;
    }

    const marketPKR = u * m;
    let html = ``;


    if (type === "PKR" && mode === "SELL") {

  const totalPKR  = u * c;   // Client Rate × USDT
  const marketPKR = u * m;   // Market Rate × USDT
  const profit    = totalPKR - marketPKR;
  lastUSDTProfit = profit;


  html += `<hr>
<div class="market">
  Total PKR:
  <span class="copy-wrap" data-copy="${totalPKR}">
    <span class="copy-value">${totalPKR.toLocaleString()}</span>
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>

<div class="client">
  Market PKR:
  <span class="copy-wrap" data-copy="${marketPKR}">
    <span class="copy-value">${marketPKR.toLocaleString()}</span>
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>

<div class="${profit >= 0 ? 'profit' : 'loss'}">
  Your ${profit >= 0 ? 'Profit' : 'Loss'}:
  <span class="copy-wrap" data-copy="${profit}">
    <span class="copy-value">${profit.toLocaleString()}</span> PKR
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>`;
}
if (type === "PKR" && mode === "BUY") {

  const totalPKR  = u * m;   // Market Rate × USDT
  const clientPKR = u * c;   // Client Rate × USDT
  const profit    = totalPKR - clientPKR;
  lastUSDTProfit = profit;


  html += `<hr>
<div class="market">
  Total PKR:
  <span class="copy-wrap" data-copy="${totalPKR}">
    <span class="copy-value">${totalPKR.toLocaleString()}</span>
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>

<div class="client">
  Client PKR:
  <span class="copy-wrap" data-copy="${clientPKR}">
    <span class="copy-value">${clientPKR.toLocaleString()}</span>
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>

<div class="${profit >= 0 ? 'profit' : 'loss'}">
  Your ${profit >= 0 ? 'Profit' : 'Loss'}:
  <span class="copy-wrap" data-copy="${profit}">
    <span class="copy-value">${profit.toLocaleString()}</span> PKR
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>`;
}



    html += `<div style="font-size:12px;color:#888;">Mode: USDT ${mode}</div>`;
    usdtOutput.innerHTML = html;
    saveUSDTBtn.classList.add("show");

}
// ===== COPY TO CLIPBOARD LOGIC =====
document.addEventListener("click", function (e) {
  const icon = e.target.closest(".copy-icon");
  if (!icon) return;

  const wrap = icon.closest(".copy-wrap");
  if (!wrap) return;

  const value = wrap.getAttribute("data-copy");
  if (!value) return;

  navigator.clipboard.writeText(value).then(() => {
    const copiedText = wrap.querySelector(".copied-text");
    if (!copiedText) return;

    copiedText.style.display = "inline";

    setTimeout(() => {
      copiedText.style.display = "none";
    }, 1000);
  });
});
function getTodayDeals() {
  const today = new Date().toLocaleDateString();
  const key = `deals_${today}`;
  return JSON.parse(localStorage.getItem(key)) || [];
}
// ===== VIEW TODAY DEALS BUTTON (STEP-3B) =====
const viewTodayDealsBtn = document.getElementById("viewTodayDeals");
const todayDealsOutput = document.getElementById("todayDealsOutput");
let dealsVisible = false;
const clearTodayDealsBtn = document.getElementById("clearTodayDeals");

// show button (because save-deal-btn is hidden by default)
viewTodayDealsBtn.classList.add("show");

viewTodayDealsBtn.addEventListener("click", () => {
  const deals = getTodayDeals();
  // TOGGLE: hide deals if already visible
  if (dealsVisible) {
    todayDealsOutput.style.display = "none";
    clearTodayDealsBtn.style.display = "none";
    dealsVisible = false;
    viewTodayDealsBtn.textContent = "View Today’s Deals";
    return;
  }


// ===== DAILY TOTAL PROFIT SUMMARY =====
const dailySummary = document.getElementById("dailySummary");
const dailyTotalProfitEl = document.getElementById("dailyTotalProfit");
const dailyDealsCountEl = document.getElementById("dailyDealsCount");

dailyDealsCountEl.textContent = deals.length;


let dailyTotal = 0;

deals.forEach(deal => {
  const profit = Number(deal.profitValue) || 0;
  dailyTotal += profit;
});

dailyTotalProfitEl.textContent = dailyTotal.toLocaleString();
dailyTotalProfitEl.classList.remove("profit", "loss");

if (dailyTotal > 0) {
  dailyTotalProfitEl.classList.add("profit");
} else if (dailyTotal < 0) {
  dailyTotalProfitEl.classList.add("loss");
}


dailySummary.style.display = deals.length ? "block" : "none";


  if (!deals.length) {
  todayDealsOutput.innerHTML = "No deals saved today.";
  todayDealsOutput.style.display = "block";
  clearTodayDealsBtn.style.display = "none";
  return;
}


  let html = "<h4>Today’s Deals</h4>";

  deals.forEach((deal, index) => {
    html += `
      <div style="margin-bottom:10px;border-bottom:1px solid #333;padding-bottom:6px;">
        <b>${index + 1}. ${deal.dealType}</b><br>
        ${deal.mode ? "Mode: " + deal.mode + "<br>" : ""}
        ${deal.amount ? "Amount: " + deal.amount + "<br>" : ""}
        ${deal.usdtAmount ? "USDT: " + deal.usdtAmount + "<br>" : ""}
        Profit: ${deal.profitValue} PKR<br>
        Date: ${deal.date}

       <button class="delete-deal-btn" data-index="${index}">
  ❌ Delete
</button>

      </div>
    `;
  });

  todayDealsOutput.innerHTML = html;
  todayDealsOutput.style.display = "block";
  clearTodayDealsBtn.style.display = "block";
  dealsVisible = true;
  viewTodayDealsBtn.textContent = "Hide Today’s Deals";


});
// ===== CLEAR TODAY DEALS BUTTON (STEP-3B PART-2) =====
clearTodayDealsBtn.addEventListener("click", () => {
  const today = new Date().toLocaleDateString();
  const key = `deals_${today}`;

  localStorage.removeItem(key);

// reset daily summary UI
const dailySummary = document.getElementById("dailySummary");
const dailyTotalProfitEl = document.getElementById("dailyTotalProfit");
const dailyDealsCountEl = document.getElementById("dailyDealsCount");

dailyTotalProfitEl.textContent = "0";
dailyDealsCountEl.textContent = "0";
dailySummary.style.display = "none";


  todayDealsOutput.innerHTML = "Today’s deals cleared.";
  todayDealsOutput.style.display = "block";
  clearTodayDealsBtn.style.display = "none";
});
// ===== DELETE SINGLE DEAL (SCREEN 2) =====
todayDealsOutput.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-deal-btn");
  if (!btn) return;

  const index = Number(btn.dataset.index);
  const today = new Date().toLocaleDateString();
  const key = `deals_${today}`;

  const deals = JSON.parse(localStorage.getItem(key)) || [];
  deals.splice(index, 1); // remove one deal

  localStorage.setItem(key, JSON.stringify(deals));

  // refresh UI by simulating "View Today Deals"
  viewTodayDealsBtn.click();
});

function showToast(message = "Saved successfully") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1000); // 1 second
}

