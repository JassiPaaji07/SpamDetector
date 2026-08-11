
(function () {
  "use strict";
  const CONDS = ["U", "L", "M", "P"];
  const LABELS = {
    U: "Unknown Sender",
    L: "Suspicious Links",
    M: "Malware Attachment",
    P: "Too Many Promotional Keywords"
  };

  const els = {
    checkboxes: {
      U: document.getElementById("cond-U"),
      L: document.getElementById("cond-L"),
      M: document.getElementById("cond-M"),
      P: document.getElementById("cond-P")
    },
    statusBadges: {
      U: document.getElementById("status-U"),
      L: document.getElementById("status-L"),
      M: document.getElementById("status-M"),
      P: document.getElementById("status-P")
    },
    condCards: {
      U: document.querySelector('.cond-card[data-cond="U"]'),
      L: document.querySelector('.cond-card[data-cond="L"]'),
      M: document.querySelector('.cond-card[data-cond="M"]'),
      P: document.querySelector('.cond-card[data-cond="P"]')
    },
    termVals: {
      U: document.getElementById("val-U"),
      L: document.getElementById("val-L"),
      M: document.getElementById("val-M"),
      P: document.getElementById("val-P")
    },
    termEval: document.getElementById("term-eval"),
    termResult: document.getElementById("term-result"),
    termFinal: document.getElementById("term-final"),

    resultCard: document.getElementById("resultCard"),
    resultIcon: document.getElementById("resultIcon"),
    resultTitle: document.getElementById("resultTitle"),
    resultFormula: document.getElementById("resultFormula"),
    resultExplain: document.getElementById("resultExplain"),
    resultReasons: document.getElementById("resultReasons"),

    conditionsCount: document.getElementById("conditionsCount"),

    senderEmail: document.getElementById("senderEmail"),
    emailSubject: document.getElementById("emailSubject"),
    emailContent: document.getElementById("emailContent"),
    analyzeBtn: document.getElementById("analyzeBtn"),
    resetBtn: document.getElementById("resetBtn"),

    navToggle: document.getElementById("navToggle"),
    navLinks: document.getElementById("navLinks")
  };

  function evaluateSpam(values) {
    // REQUIRED: OR logic — do not replace with AND
    const isSpam = values.U || values.L || values.M || values.P;
    return isSpam;
  }

  function getValues() {
    const values = {};
    CONDS.forEach((c) => {
      values[c] = !!els.checkboxes[c].checked;
    });
    return values;
  }

  function bool(v) {
    return v ? "TRUE" : "FALSE";
  }

  function renderConditions(values) {
    let activeCount = 0;
    CONDS.forEach((c) => {
      const active = values[c];
      if (active) activeCount++;
      els.statusBadges[c].textContent = bool(active);
      els.condCards[c].classList.toggle("active", active);
      els.termVals[c].textContent = bool(active);
    });
    els.conditionsCount.textContent = `${activeCount} / 4 conditions active`;
  }

  function renderTerminal(values, isSpam) {
    const evalStr = CONDS.map((c) => bool(values[c])).join(" ∨ ");
    els.termEval.textContent = evalStr;
    els.termResult.textContent = bool(isSpam);
    els.termFinal.textContent = bool(isSpam);
  }

  function renderResult(values, isSpam) {
    els.resultCard.classList.toggle("result-spam", isSpam);
    els.resultCard.classList.toggle("result-safe", !isSpam);

    if (isSpam) {
      els.resultIcon.innerHTML = "&#9888;";
      els.resultTitle.textContent = "SPAM EMAIL DETECTED";
      els.resultFormula.textContent = "S = TRUE";
      els.resultExplain.textContent =
        "At least one SPAM condition is TRUE, so the email is classified as SPAM.";

      const trueConds = CONDS.filter((c) => values[c]);
      els.resultReasons.innerHTML = "";
      trueConds.forEach((c) => {
        const li = document.createElement("li");
        li.textContent = `Spam detected because ${LABELS[c]} is TRUE.`;
        els.resultReasons.appendChild(li);
      });
    } else {
      els.resultIcon.innerHTML = "&#10003;";
      els.resultTitle.textContent = "NOT SPAM";
      els.resultFormula.textContent = "S = FALSE";
      els.resultExplain.textContent =
        "All four spam conditions are FALSE, therefore the email is not classified as spam under this logical model.";
      els.resultReasons.innerHTML = "";
    }
  }

  function update() {
    const values = getValues();
    const isSpam = evaluateSpam(values);
    renderConditions(values);
    renderTerminal(values, isSpam);
    renderResult(values, isSpam);
  }

  CONDS.forEach((c) => {
    els.checkboxes[c].addEventListener("change", update);
  });
   
  els.analyzeBtn.addEventListener("click", () => {
    update();
    els.resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  els.resetBtn.addEventListener("click", () => {
    els.senderEmail.value = "";
    els.emailSubject.value = "";
    els.emailContent.value = "";
    CONDS.forEach((c) => {
      els.checkboxes[c].checked = false;
    });
    update();
  });

  const PRESETS = {
    lottery: {
      sender: "unknown-promo@random-domain.xyz",
      subject: "You have won a FREE iPhone — claim now!!!",
      content: "Click here to claim your reward. Limited time offer! Discount, free, guaranteed winner.",
      values: { U: true, L: true, M: false, P: true }
    },
    invoice: {
      sender: "billing-alert@secure-payments-verify.info",
      subject: "URGENT: Unpaid Invoice Attached — Action Required",
      content: "Please review the attached invoice file immediately and update your payment details via the link below.",
      values: { U: true, L: true, M: true, P: false }
    },
    promo: {
      sender: "newsletter@your-favorite-store.com",
      subject: "Your Weekly Newsletter",
      content: "Here is a short summary of this week's updates from a store you're already subscribed to.",
      values: { U: false, L: false, M: false, P: false }
    },
    colleague: {
      sender: "priya.sharma@company.com",
      subject: "Notes from today's meeting",
      content: "Hi, sharing the notes from our sync today. Let me know if I missed anything.",
      values: { U: false, L: false, M: false, P: false }
    }
  };

  document.querySelectorAll(".preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-preset");
      const preset = PRESETS[key];
      if (!preset) return;

      els.senderEmail.value = preset.sender;
      els.emailSubject.value = preset.subject;
      els.emailContent.value = preset.content;

      CONDS.forEach((c) => {
        els.checkboxes[c].checked = !!preset.values[c];
      });

      update();
    });
  });
   
  /* ---------------------------------------------------
     SELF-TEST (console only — verifies required test cases)
  --------------------------------------------------- */
  (function selfTest() {
    const cases = [
      { U: false, L: false, M: false, P: false, expect: false },
      { U: true, L: false, M: false, P: false, expect: true },
      { U: false, L: true, M: false, P: false, expect: true },
      { U: false, L: false, M: true, P: false, expect: true },
      { U: false, L: false, M: false, P: true, expect: true },
      { U: true, L: true, M: true, P: true, expect: true }
    ];
    const allPass = cases.every((c) => evaluateSpam(c) === c.expect);
    if (!allPass) {
      console.error("Spam logic self-test FAILED");
    }
  })();
})();
