(() => {
  const s = document.createElement("style");
  s.textContent = `
  .qc-fab {
    position: fixed;
    right: 16px;
    bottom: 16px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.08);
    color: #fff;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(8px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 9997;
    transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
  }
  .qc-fab svg {
    width: 20px;
    height: 20px;
    display: block;
  }
  .qc-fab:hover { transform: translateY(-1px); background: rgba(255,255,255,0.12); box-shadow: 0 10px 30px rgba(0,0,0,0.45); }
  .qc-fab:active { transform: translateY(0) scale(0.98); }
  .qc-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(4px);
    z-index: 9998;
    opacity: 0;
    pointer-events: none;
    transition: opacity .25s ease;
  }
  .qc-overlay.show { opacity: 1; pointer-events: auto; }
  .qc-panel {
    position: fixed;
    right: 0;
    bottom: 0;
    width: 300px;
    max-width: 90vw;
    max-height: 80vh;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-left: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(14px);
    color: #fff;
    border-top-left-radius: 14px;
    box-shadow: -8px 0 32px rgba(0,0,0,0.4);
    transform: translateX(100%);
    transition: transform .25s ease;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .qc-panel.show { transform: translateX(0); }
  @media (max-width: 768px) {
    .qc-panel {
      left: 0;
      right: 0;
      width: 100%;
      height: 75vh;
      max-height: 80vh;
      border-top-left-radius: 14px;
      border-top-right-radius: 14px;
      border-left: none;
      border-right: none;
      transform: translateY(100%);
    }
    .qc-panel.show { transform: translateY(0); }
  }
  .qc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    font-weight: 700;
  }
  .qc-close {
    border: none;
    background: rgba(255,255,255,0.12);
    color: #fff;
    border-radius: 8px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    transition: background .2s ease, transform .2s ease;
  }
  .qc-close:hover { background: rgba(255,255,255,0.18); transform: translateY(-1px); }
  .qc-helper {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    padding: 8px 14px 0 14px;
  }
  .qc-display {
    margin: 10px 14px;
    padding: 10px 10px;
    border-radius: 10px;
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 18px;
    line-height: 1.4;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .qc-display-text {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .qc-display-clear {
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(239,68,68,0.18);
    color: #fff;
    border-radius: 8px;
    height: 32px;
    min-height: 32px;
    padding: 0 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
  }
  .qc-display-clear:hover { background: rgba(239,68,68,0.25); transform: translateY(-1px); }
  .qc-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 0 14px 14px 14px;
  }
  .qc-btn {
    height: 48px;
    min-height: 44px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.08);
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
    font-family: inherit;
  }
  .qc-btn:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
  .qc-btn:active { transform: translateY(0) scale(0.98); }
  .qc-btn.op { background: rgba(10,132,255,0.18); border-color: rgba(10,132,255,0.35); }
  .qc-btn.equal { background: rgba(34,197,94,0.18); border-color: rgba(34,197,94,0.35); }
  /* Clear button moved into display to save vertical space */
  `;
  document.head.appendChild(s);
  const fab = document.createElement("button");
  fab.className = "qc-fab";
  fab.type = "button";
  fab.title = "Quick Calculator";
  fab.setAttribute("aria-label", "Quick Calculator");
  fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="6.5" y="6.5" width="11" height="3.5" rx="0.7" fill="currentColor"/><circle cx="8" cy="12.5" r="1.5" fill="currentColor"/><circle cx="12" cy="12.5" r="1.5" fill="currentColor"/><circle cx="16" cy="12.5" r="1.5" fill="currentColor"/><circle cx="8" cy="16.5" r="1.5" fill="currentColor"/><circle cx="12" cy="16.5" r="1.5" fill="currentColor"/><circle cx="16" cy="16.5" r="1.5" fill="currentColor"/></svg>';
  const overlay = document.createElement("div");
  overlay.className = "qc-overlay";
  const panel = document.createElement("div");
  panel.className = "qc-panel";
  const header = document.createElement("div");
  header.className = "qc-header";
  const title = document.createElement("div");
  title.textContent = "Quick Calculator";
  const closeBtn = document.createElement("button");
  closeBtn.className = "qc-close";
  closeBtn.type = "button";
  closeBtn.textContent = "×";
  header.appendChild(title);
  header.appendChild(closeBtn);
  const helper = document.createElement("div");
  helper.className = "qc-helper";
  helper.textContent = "Use for quick deal calculations";
  const display = document.createElement("div");
  display.className = "qc-display";
  const displayText = document.createElement("div");
  displayText.className = "qc-display-text";
  displayText.textContent = "0";
  const displayClear = document.createElement("button");
  displayClear.className = "qc-display-clear";
  displayClear.type = "button";
  displayClear.textContent = "C";
  const grid = document.createElement("div");
  grid.className = "qc-grid";
  const makeBtn = (label, cls) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "qc-btn" + (cls ? " " + cls : "");
    b.textContent = label;
    return b;
  };
  const btns = [
    makeBtn("7"), makeBtn("8"), makeBtn("9"), makeBtn("÷", "op"),
    makeBtn("4"), makeBtn("5"), makeBtn("6"), makeBtn("×", "op"),
    makeBtn("1"), makeBtn("2"), makeBtn("3"), makeBtn("−", "op"),
    makeBtn("0"), makeBtn("."), makeBtn("=", "equal"), makeBtn("+", "op")
  ];
  btns.forEach(b => grid.appendChild(b));
  display.appendChild(displayText);
  display.appendChild(displayClear);
  panel.appendChild(header);
  panel.appendChild(helper);
  panel.appendChild(display);
  panel.appendChild(grid);
  document.body.appendChild(fab);
  document.body.appendChild(overlay);
  document.body.appendChild(panel);
  let current = "0";
  let stored = null;
  let op = null;
  let justEvaluated = false;
  const opVisual = o => (o === "+") ? "+" : (o === "-") ? "−" : (o === "*") ? "×" : (o === "/") ? "÷" : "";
  const updateDisplay = () => {
    if (op !== null && stored !== null) {
      const sym = opVisual(op);
      if (current && current !== "0") {
        displayText.textContent = String(stored) + " " + sym + " " + String(current);
      } else {
        displayText.textContent = String(stored) + " " + sym;
      }
      return;
    }
    displayText.textContent = current;
  };
  const reset = () => {
    current = "0";
    stored = null;
    op = null;
    justEvaluated = false;
    updateDisplay();
  };
  const open = () => {
    overlay.classList.add("show");
    panel.classList.add("show");
  };
  const close = () => {
    overlay.classList.remove("show");
    panel.classList.remove("show");
  };
  fab.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) close();
  });
  const handleNumber = ch => {
    if (justEvaluated) {
      current = "0";
      justEvaluated = false;
    }
    if (ch === ".") {
      if (!current.includes(".")) current += ".";
      updateDisplay();
      return;
    }
    if (current === "0") current = ch;
    else current += ch;
    updateDisplay();
  };
  const mapOp = l => {
    if (l === "+") return "+";
    if (l === "−") return "-";
    if (l === "×") return "*";
    if (l === "÷") return "/";
    return null;
  };
  const apply = () => {
    const a = Number(stored);
    const b = Number(current);
    if (!isFinite(a) || !isFinite(b) || op === null) return;
    let r = 0;
    if (op === "+") r = a + b;
    else if (op === "-") r = a - b;
    else if (op === "*") r = a * b;
    else if (op === "/") {
      if (b === 0) {
        displayText.textContent = "Error";
        reset();
        return;
      }
      r = a / b;
    }
    current = String(r);
    stored = null;
    op = null;
    updateDisplay();
    justEvaluated = true;
  };
  const handleOp = l => {
    const m = mapOp(l);
    if (m === null) return;
    if (stored !== null && op !== null) {
      apply();
      stored = current;
      op = m;
      justEvaluated = false;
      return;
    }
    stored = current;
    op = m;
    current = "0";
    updateDisplay();
    justEvaluated = false;
  };
  btns.forEach(b => {
    const t = b.textContent;
    if (t === "=") {
      b.addEventListener("click", apply);
      return;
    }
    if (t === "." || /^[0-9]$/.test(t)) {
      b.addEventListener("click", () => handleNumber(t));
      return;
    }
    b.addEventListener("click", () => handleOp(t));
  });
  displayClear.addEventListener("click", reset);
  panel.appendChild(header);
  panel.appendChild(helper);
  panel.appendChild(display);
  panel.appendChild(grid);
  updateDisplay();
})();
