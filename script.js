/* ===== TAB SWITCH ===== */
function setTopLevelTab(activeTab) {
  const tabs = [
    { key: "currency", el: currencyTab },
    { key: "usdt", el: usdtTab },
    { key: "ledger", el: ledgerTab },
    { key: "pkr", el: pkrTab }
  ];

  const sections = [
    { key: "currency", el: currencySection },
    { key: "usdt", el: usdtSection },
    { key: "ledger", el: ledgerSection },
    { key: "pkr", el: pkrLedgerSection }
  ];

  tabs.forEach(t => {
    if (!t.el) return;
    t.el.classList.toggle("active", t.key === activeTab);
  });

  sections.forEach(s => {
    if (!s.el) return;
    s.el.style.display = s.key === activeTab ? "block" : "none";
  });

  const viewBtn = document.getElementById("viewTodayDeals");
  const clearBtn = document.getElementById("clearTodayDeals");
  const output = document.getElementById("todayDealsOutput");
  const dailySummary = document.getElementById("dailySummary");

  if (activeTab === "ledger" || activeTab === "pkr") {
    if (viewBtn) viewBtn.style.display = "none";
    if (clearBtn) clearBtn.style.display = "none";
    if (output) output.style.display = "none";
    if (dailySummary) dailySummary.style.display = "none";
    if (viewBtn) viewBtn.textContent = "View Today's Deals";
    if (typeof dealsVisible !== "undefined") dealsVisible = false;
  } else {
    if (viewBtn) viewBtn.style.display = "";
  }
}

currencyTab.onclick = () => setTopLevelTab("currency");
usdtTab.onclick = () => setTopLevelTab("usdt");
ledgerTab.onclick = () => {
  setTopLevelTab("ledger");
  if (typeof renderLedgerView === "function") renderLedgerView();
};
pkrTab.onclick = () => {
  setTopLevelTab("pkr");
  if (typeof renderPkrLedgerView === "function") renderPkrLedgerView();
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
let lastCurrencyProfitType = null; // "PKR" or "USDT"


const saveCurrencyBtn = document.getElementById("saveCurrencyDeal");
const saveUSDTBtn = document.getElementById("saveUSDTDeal");
const saveLedgerEntryBtn = document.getElementById("saveLedgerEntry");
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
    profitType: lastCurrencyProfitType, // Store profit currency type
    date: new Date().toLocaleDateString()
  };

  saveDealToLocalStorage(dealData);
  showToast();
  console.log("Saved Currency Deal:", dealData);
  
  // Auto-clear input fields after saving
  cAmount.value = "1";
  curRateUSDT.value = "";
  curUsdtPKR.value = "";
  curClientRate.value = "";
  cClientType.value = "PKR";
  lastCurrencyProfit = null;
  lastCurrencyProfitType = null;
  cOutput.innerHTML = "Enter values to see result.";
  saveCurrencyBtn.classList.remove("show");
  
  // Real-time update if "View Today's Deals" is open
  // Check DOM state directly to see if deals panel is visible
  const dealsOutput = document.getElementById("todayDealsOutput");
  const isDealsVisible = dealsOutput && dealsOutput.style.display !== "none";
  
  if (isDealsVisible) {
    // Use setTimeout to ensure functions are defined (they're defined later in script)
    setTimeout(() => {
      if (typeof updateDailySummary === 'function') {
        updateDailySummary();
      }
      if (typeof renderDealsList === 'function') {
        const todayDealsOutput = document.getElementById("todayDealsOutput");
        const clearTodayDealsBtn = document.getElementById("clearTodayDeals");
        if (todayDealsOutput && clearTodayDealsBtn) {
          renderDealsList(todayDealsOutput, clearTodayDealsBtn);
        }
      }
    }, 0);
  }
});




[cAmount, cRateUSDT, cUsdtPKR, cClientRate, cClientType]
.forEach(el => el.addEventListener("input", calculateCurrency));
// ===== FIX: Disable USDT → PKR Rate when Client Rate is USDT =====
cClientType.addEventListener("change", () => {
  if (cClientType.value === "USDT") {
  cUsdtPKR.value = "";
  cUsdtPKR.disabled = true;
  cUsdtPKR.placeholder = "Disabled because Agreed Client Rate is set to USDT";
} else {
  cUsdtPKR.disabled = false;
  cUsdtPKR.placeholder = ""; // blank when PKR mode
}



  calculateCurrency(); // re-calc safely
});


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
            lastCurrencyProfitType = "PKR";
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
        lastCurrencyProfit = profitUSDT;
        lastCurrencyProfitType = "USDT";
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
    profitType: "PKR", // USDT deals always in PKR
    date: new Date().toLocaleDateString()
  };
  saveDealToLocalStorage(dealData);
  showToast();
  console.log("Saved USDT Deal:", dealData);
  // ===== FIX: Auto-clear USDT inputs after successful save =====
usdtAmount.value = "";
marketRate.value = "";
clientRate.value = "";

lastUSDTProfit = null;
usdtOutput.innerHTML = "Enter values to see result.";
saveUSDTBtn.classList.remove("show");

// Clear stored values for current mode (SELL / BUY)
usdtData[mode] = { u:"", m:"", c:"", type:"PKR" };

  // Real-time update if "View Today's Deals" is open
  // Check DOM state directly to see if deals panel is visible
  const dealsOutput = document.getElementById("todayDealsOutput");
  const isDealsVisible = dealsOutput && dealsOutput.style.display !== "none";
  
  if (isDealsVisible) {
    // Use setTimeout to ensure functions are defined (they're defined later in script)
    setTimeout(() => {
      if (typeof updateDailySummary === 'function') {
        updateDailySummary();
      }
      if (typeof renderDealsList === 'function') {
        const todayDealsOutput = document.getElementById("todayDealsOutput");
        const clearTodayDealsBtn = document.getElementById("clearTodayDeals");
        if (todayDealsOutput && clearTodayDealsBtn) {
          renderDealsList(todayDealsOutput, clearTodayDealsBtn);
        }
      }
    }, 0);
  }
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

// Function to update daily summary
function updateDailySummary() {
  const deals = getTodayDeals();
  const dailySummary = document.getElementById("dailySummary");
  const dailyTotalProfitEl = document.getElementById("dailyTotalProfit");
  const dailyTotalProfitUSDTEl = document.getElementById("dailyTotalProfitUSDT");
  const dailyDealsCountEl = document.getElementById("dailyDealsCount");

  dailyDealsCountEl.textContent = deals.length;

  let dailyTotalPKR = 0;
  let dailyTotalUSDT = 0;

  deals.forEach(deal => {
    const profit = Number(deal.profitValue) || 0;
    const profitType = deal.profitType || "PKR"; // Default to PKR for backward compatibility
    
    if (profitType === "USDT") {
      dailyTotalUSDT += profit;
    } else {
      dailyTotalPKR += profit;
    }
  });

  dailyTotalProfitEl.textContent = dailyTotalPKR.toLocaleString();
  dailyTotalProfitUSDTEl.textContent = dailyTotalUSDT.toLocaleString();

  // Apply profit/loss classes to PKR total
  dailyTotalProfitEl.classList.remove("profit", "loss");
  if (dailyTotalPKR > 0) {
    dailyTotalProfitEl.classList.add("profit");
  } else if (dailyTotalPKR < 0) {
    dailyTotalProfitEl.classList.add("loss");
  }

  // Apply profit/loss classes to USDT total
  dailyTotalProfitUSDTEl.classList.remove("profit", "loss");
  if (dailyTotalUSDT > 0) {
    dailyTotalProfitUSDTEl.classList.add("profit");
  } else if (dailyTotalUSDT < 0) {
    dailyTotalProfitUSDTEl.classList.add("loss");
  }

  dailySummary.style.display = deals.length ? "block" : "none";
}

// Function to render deals list
function renderDealsList(outputElement, clearBtn) {
  const deals = getTodayDeals();
  
  if (!deals.length) {
    outputElement.innerHTML = "No deals saved today.";
    outputElement.style.display = "block";
    clearBtn.style.display = "none";
    return;
  }

  let html = "<h4>Today's Deals</h4>";

  deals.forEach((deal, index) => {
    const profitType = deal.profitType || "PKR";
    html += `
      <div style="margin-bottom:10px;border-bottom:1px solid #333;padding-bottom:6px;">
        <b>${index + 1}. ${deal.dealType}</b><br>
        ${deal.mode ? "Mode: " + deal.mode + "<br>" : ""}
        ${deal.amount ? "Amount: " + deal.amount + "<br>" : ""}
        ${deal.usdtAmount ? "USDT: " + deal.usdtAmount + "<br>" : ""}
        Profit: ${deal.profitValue} ${profitType}<br>
        Date: ${deal.date}

       <button class="delete-deal-btn" data-index="${index}">
  ❌ Delete
</button>

      </div>
    `;
  });

  outputElement.innerHTML = html;
  outputElement.style.display = "block";
  clearBtn.style.display = "block";
}

// Event listener for View Today's Deals button (works from both tabs)
viewTodayDealsBtn.addEventListener("click", () => {
  const deals = getTodayDeals();
  // TOGGLE: hide deals if already visible
  if (dealsVisible) {
    todayDealsOutput.style.display = "none";
    clearTodayDealsBtn.style.display = "none";
    const dailySummary = document.getElementById("dailySummary");
    dailySummary.style.display = "none"; // Hide profit section
    dealsVisible = false;
    viewTodayDealsBtn.textContent = "View Today's Deals";
    return;
  }

  // Update daily summary
  updateDailySummary();

  // Use shared output element (works from both tabs)
  renderDealsList(todayDealsOutput, clearTodayDealsBtn);
  
  dealsVisible = true;
  viewTodayDealsBtn.textContent = "Hide Today's Deals";
});
// ===== CLEAR TODAY DEALS BUTTON (STEP-3B PART-2) =====
function clearTodayDeals() {
  const today = new Date().toLocaleDateString();
  const key = `deals_${today}`;

  localStorage.removeItem(key);

  // reset daily summary UI
  const dailySummary = document.getElementById("dailySummary");
  const dailyTotalProfitEl = document.getElementById("dailyTotalProfit");
  const dailyTotalProfitUSDTEl = document.getElementById("dailyTotalProfitUSDT");
  const dailyDealsCountEl = document.getElementById("dailyDealsCount");

  dailyTotalProfitEl.textContent = "0";
  dailyTotalProfitUSDTEl.textContent = "0";
  dailyDealsCountEl.textContent = "0";
  dailySummary.style.display = "none";

  // Use shared output element
  todayDealsOutput.innerHTML = "Today's deals cleared.";
  todayDealsOutput.style.display = "block";
  clearTodayDealsBtn.style.display = "none";
  dealsVisible = false;
  viewTodayDealsBtn.textContent = "View Today's Deals";
}

clearTodayDealsBtn.addEventListener("click", clearTodayDeals);

// ===== DELETE SINGLE DEAL (SCREEN 2) =====
function handleDeleteDeal(e) {
  const btn = e.target.closest(".delete-deal-btn");
  if (!btn) return;

  const index = Number(btn.dataset.index);
  const today = new Date().toLocaleDateString();
  const key = `deals_${today}`;

  const deals = JSON.parse(localStorage.getItem(key)) || [];
  deals.splice(index, 1); // remove one deal

  localStorage.setItem(key, JSON.stringify(deals));

  // refresh UI by simulating "View Today Deals"
  // Keep deals visible after delete
dealsVisible = true;
viewTodayDealsBtn.textContent = "Hide Today's Deals";

// Re-render updated deals list
updateDailySummary();
renderDealsList(todayDealsOutput, clearTodayDealsBtn);

}

todayDealsOutput.addEventListener("click", handleDeleteDeal);

function showToast(message = "Saved successfully") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1000); // 1 second
}

function getLedgerEntries() {
  const raw = localStorage.getItem("usdt_ledger");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveLedgerEntries(entries) {
  localStorage.setItem("usdt_ledger", JSON.stringify(entries));
}

let ledgerMode = "GIVE";

const giveUsdtBtn = document.getElementById("giveUsdtBtn");
const takeUsdtBtn = document.getElementById("takeUsdtBtn");
const ledgerPersonInput = document.getElementById("ledgerPerson");
const ledgerAmountInput = document.getElementById("ledgerAmount");
const ledgerRateInput = document.getElementById("ledgerRate");
const ledgerNotesInput = document.getElementById("ledgerNotes");
const ledgerDateInput = document.getElementById("ledgerDate");
const ledgerEntriesBody = document.getElementById("ledgerEntriesBody");
const ledgerSummaryLabel = document.getElementById("ledgerSummaryLabel");
const ledgerTotalEl = document.getElementById("ledgerTotal");

function initLedgerDate() {
  if (!ledgerDateInput) return;
  if (!ledgerDateInput.value) {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    ledgerDateInput.value = iso;
  }
}

function updateLedgerSummary() {
  if (!ledgerSummaryLabel || !ledgerTotalEl) return;

  const entries = getLedgerEntries().filter(e => e.mode === ledgerMode);
  const total = entries.reduce((sum, entry) => {
    const value = Number(entry.amount) || 0;
    return sum + value;
  }, 0);

  if (ledgerMode === "GIVE") {
    ledgerSummaryLabel.textContent = "Total USDT to Receive:";
  } else {
    ledgerSummaryLabel.textContent = "Total USDT to Return:";
  }

  ledgerTotalEl.textContent = total.toFixed(2);
}

function renderLedgerEntries() {
  if (!ledgerEntriesBody) return;

  const entries = getLedgerEntries().filter(e => e.mode === ledgerMode);

  if (!entries.length) {
    ledgerEntriesBody.innerHTML = "";
    updateLedgerSummary();
    return;
  }

  let html = "";
  entries.forEach((entry, index) => {
    const amount = Number(entry.amount) || 0;
    const rate = entry.rate !== undefined && entry.rate !== null && entry.rate !== "" ? Number(entry.rate) : "";
    const formattedAmount = amount ? amount.toFixed(2) : "";
    const formattedRate = rate === "" ? "" : Number(rate).toFixed(2);
    const safePerson = entry.person || "";
    const safeNotes = entry.notes || "";
    const safeDate = entry.date || "";

    html += `<tr data-id="${entry.id}">
<td>${index + 1}</td>
<td>${safePerson}</td>
<td>${formattedAmount}</td>
<td>${formattedRate}</td>
<td>${safeNotes}</td>
<td>${safeDate}</td>
<td><button class="delete-deal-btn ledger-delete-btn" data-id="${entry.id}" type="button">Delete</button></td>
</tr>`;
  });

  ledgerEntriesBody.innerHTML = html;
  updateLedgerSummary();
}

function renderLedgerView() {
  initLedgerDate();
  renderLedgerEntries();
}

if (giveUsdtBtn && takeUsdtBtn) {
  giveUsdtBtn.addEventListener("click", () => {
    ledgerMode = "GIVE";
    giveUsdtBtn.classList.add("active");
    takeUsdtBtn.classList.remove("active");
    renderLedgerView();
  });

  takeUsdtBtn.addEventListener("click", () => {
    ledgerMode = "TAKE";
    takeUsdtBtn.classList.add("active");
    giveUsdtBtn.classList.remove("active");
    renderLedgerView();
  });
}

if (saveLedgerEntryBtn && ledgerPersonInput && ledgerAmountInput) {
  saveLedgerEntryBtn.addEventListener("click", () => {
    const person = (ledgerPersonInput.value || "").trim();
    const amountRaw = ledgerAmountInput.value;
    const amount = Number(amountRaw);
    const rateRaw = ledgerRateInput ? ledgerRateInput.value : "";
    const rate = rateRaw === "" ? "" : Number(rateRaw);
    const notes = ledgerNotesInput ? ledgerNotesInput.value.trim() : "";
    const dateValue = ledgerDateInput && ledgerDateInput.value ? ledgerDateInput.value : new Date().toISOString().slice(0, 10);

    if (!person) {
      alert("Person Name is required.");
      return;
    }

    if (!amount || !isFinite(amount)) {
      alert("USDT Amount is required.");
      return;
    }

    const entry = {
      id: Date.now(),
      person: person,
      mode: ledgerMode,
      amount: amount,
      rate: rate === "" || !isFinite(rate) ? "" : rate,
      notes: notes,
      date: dateValue
    };

    const entries = getLedgerEntries();
    entries.push(entry);
    saveLedgerEntries(entries);

    ledgerPersonInput.value = "";
    ledgerAmountInput.value = "";
    if (ledgerRateInput) ledgerRateInput.value = "";
    if (ledgerNotesInput) ledgerNotesInput.value = "";
    if (ledgerDateInput) {
      const todayIso = new Date().toISOString().slice(0, 10);
      ledgerDateInput.value = todayIso;
    }

    renderLedgerView();
    showToast("Ledger entry saved");
  });
}

if (ledgerEntriesBody) {
  ledgerEntriesBody.addEventListener("click", event => {
    const button = event.target.closest(".ledger-delete-btn");
    if (!button) return;
    const id = button.getAttribute("data-id");
    if (!id) return;

    const entries = getLedgerEntries();
    const filtered = entries.filter(entry => String(entry.id) !== String(id));
    saveLedgerEntries(filtered);
    renderLedgerView();
    showToast("Ledger entry deleted");
  });
}

renderLedgerView();
function getPkrLedgerEntries() {
  const raw = localStorage.getItem("pkr_ledger");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function savePkrLedgerEntries(entries) {
  localStorage.setItem("pkr_ledger", JSON.stringify(entries));
}

let pkrLedgerMode = "GIVE";

const givePkrBtn = document.getElementById("givePkrBtn");
const takePkrBtn = document.getElementById("takePkrBtn");
const pkrLedgerPersonInput = document.getElementById("pkrLedgerPerson");
const pkrLedgerAmountInput = document.getElementById("pkrLedgerAmount");
const pkrLedgerRateInput = document.getElementById("pkrLedgerRate");
const pkrLedgerNotesInput = document.getElementById("pkrLedgerNotes");
const pkrLedgerDateInput = document.getElementById("pkrLedgerDate");
const pkrLedgerEntriesBody = document.getElementById("pkrLedgerEntriesBody");
const pkrLedgerSummaryLabel = document.getElementById("pkrLedgerSummaryLabel");
const pkrLedgerTotalEl = document.getElementById("pkrLedgerTotal");

function initPkrLedgerDate() {
  if (!pkrLedgerDateInput) return;
  if (!pkrLedgerDateInput.value) {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    pkrLedgerDateInput.value = iso;
  }
}

function updatePkrLedgerSummary() {
  if (!pkrLedgerSummaryLabel || !pkrLedgerTotalEl) return;
  const entries = getPkrLedgerEntries().filter(e => e.mode === pkrLedgerMode);
  const total = entries.reduce((sum, entry) => {
    const value = Number(entry.amount) || 0;
    return sum + value;
  }, 0);
  if (pkrLedgerMode === "GIVE") {
    pkrLedgerSummaryLabel.textContent = "Total PKR to Receive:";
  } else {
    pkrLedgerSummaryLabel.textContent = "Total PKR to Return:";
  }
  pkrLedgerTotalEl.textContent = total.toFixed(2);
}

function renderPkrLedgerEntries() {
  if (!pkrLedgerEntriesBody) return;
  const entries = getPkrLedgerEntries().filter(e => e.mode === pkrLedgerMode);
  if (!entries.length) {
    pkrLedgerEntriesBody.innerHTML = "";
    updatePkrLedgerSummary();
    return;
  }
  let html = "";
  entries.forEach((entry, index) => {
    const amount = Number(entry.amount) || 0;
    const rate = entry.rate !== undefined && entry.rate !== null && entry.rate !== "" ? Number(entry.rate) : "";
    const formattedAmount = amount ? amount.toFixed(2) : "";
    const formattedRate = rate === "" ? "" : Number(rate).toFixed(2);
    const safePerson = entry.person || "";
    const safeNotes = entry.notes || "";
    const safeDate = entry.date || "";
    html += `<tr data-id="${entry.id}">
<td>${index + 1}</td>
<td>${safePerson}</td>
<td>${formattedAmount}</td>
<td>${formattedRate}</td>
<td>${safeNotes}</td>
<td>${safeDate}</td>
<td><button class="delete-deal-btn pkr-ledger-delete-btn" data-id="${entry.id}" type="button">Delete</button></td>
</tr>`;
  });
  pkrLedgerEntriesBody.innerHTML = html;
  updatePkrLedgerSummary();
}

function renderPkrLedgerView() {
  initPkrLedgerDate();
  renderPkrLedgerEntries();
}

if (givePkrBtn && takePkrBtn) {
  givePkrBtn.addEventListener("click", () => {
    pkrLedgerMode = "GIVE";
    givePkrBtn.classList.add("active");
    takePkrBtn.classList.remove("active");
    renderPkrLedgerView();
  });
  takePkrBtn.addEventListener("click", () => {
    pkrLedgerMode = "TAKE";
    takePkrBtn.classList.add("active");
    givePkrBtn.classList.remove("active");
    renderPkrLedgerView();
  });
}

const savePkrLedgerEntryBtn = document.getElementById("savePkrLedgerEntry");
if (savePkrLedgerEntryBtn && pkrLedgerPersonInput && pkrLedgerAmountInput) {
  savePkrLedgerEntryBtn.addEventListener("click", () => {
    const person = (pkrLedgerPersonInput.value || "").trim();
    const amountRaw = pkrLedgerAmountInput.value;
    const amount = Number(amountRaw);
    const rateRaw = pkrLedgerRateInput ? pkrLedgerRateInput.value : "";
    const rate = rateRaw === "" ? "" : Number(rateRaw);
    const notes = pkrLedgerNotesInput ? pkrLedgerNotesInput.value.trim() : "";
    const dateValue = pkrLedgerDateInput && pkrLedgerDateInput.value ? pkrLedgerDateInput.value : new Date().toISOString().slice(0, 10);
    if (!person) {
      alert("Person Name is required.");
      return;
    }
    if (!amount || !isFinite(amount)) {
      alert("PKR Amount is required.");
      return;
    }
    const entry = {
      id: Date.now(),
      person: person,
      mode: pkrLedgerMode,
      amount: amount,
      rate: rate === "" || !isFinite(rate) ? "" : rate,
      notes: notes,
      date: dateValue
    };
    const entries = getPkrLedgerEntries();
    entries.push(entry);
    savePkrLedgerEntries(entries);
    pkrLedgerPersonInput.value = "";
    pkrLedgerAmountInput.value = "";
    if (pkrLedgerRateInput) pkrLedgerRateInput.value = "";
    if (pkrLedgerNotesInput) pkrLedgerNotesInput.value = "";
    if (pkrLedgerDateInput) {
      const todayIso = new Date().toISOString().slice(0, 10);
      pkrLedgerDateInput.value = todayIso;
    }
    renderPkrLedgerView();
    showToast("Ledger entry saved");
  });
}

if (pkrLedgerEntriesBody) {
  pkrLedgerEntriesBody.addEventListener("click", event => {
    const button = event.target.closest(".pkr-ledger-delete-btn");
    if (!button) return;
    const id = button.getAttribute("data-id");
    if (!id) return;
    const entries = getPkrLedgerEntries();
    const filtered = entries.filter(entry => String(entry.id) !== String(id));
    savePkrLedgerEntries(filtered);
    renderPkrLedgerView();
    showToast("Ledger entry deleted");
  });
}
// Support toggle - Screen 3 Step 3 (JS only)
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("supportToggleBtn");
  const toggleBox = document.getElementById("supportToggle");

  if (!toggleBtn || !toggleBox) return;

  toggleBtn.addEventListener("click", function () {
    toggleBox.classList.toggle("active");
  });
});
// Support crypto copy - isolated & safe
document.addEventListener("DOMContentLoaded", function () {

  const supportIcons = document.querySelectorAll(".support-copy-icon");

  supportIcons.forEach(icon => {
    icon.addEventListener("click", function () {

      const addressEl = this.previousElementSibling;
      if (!addressEl) return;

      const address = addressEl.innerText.trim();

      navigator.clipboard.writeText(address).then(() => {
        const original = this.innerText;

        this.innerText = "Copied";

        setTimeout(() => {
          this.innerText = original;
        }, 1000);
      });

    });
  });

});
