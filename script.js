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

/* ===== CURRENCY DEAL LOGIC (UNTOUCHED) ===== */
const cAmount = curAmount;
const cRateUSDT = curRateUSDT;
const cUsdtPKR = curUsdtPKR;
const cClientRate = curClientRate;
const cClientType = curClientType;
const cOutput = currencyOutput;

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
}

/* ===== USDT DEAL FIXED (SELL & BUY SEPARATE STATE) ===== */
let mode = "SELL";

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


    if(type === "PKR"){
    const clientPKR = u * c;
    const profit = mode === "SELL" ? clientPKR - marketPKR : marketPKR - clientPKR;

    html += `<hr>
<div class="market">
  Total PKR:
  <span class="copy-wrap" data-copy="${clientPKR}">
    <span class="copy-value">${clientPKR.toLocaleString()}</span>
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

<div class="${profit>=0 ? 'profit' : 'loss'}">
  Your ${profit>=0 ? 'Profit' : 'Loss'}:
  <span class="copy-wrap" data-copy="${profit}">
    <span class="copy-value">${profit.toLocaleString()}</span> PKR
    <span class="copy-icon">📋</span>
    <span class="copied-text">Copied</span>
  </span>
</div>`;

}


    html += `<div style="font-size:12px;color:#888;">Mode: USDT ${mode}</div>`;
    usdtOutput.innerHTML = html;
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
