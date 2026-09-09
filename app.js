/**
 * OWASP Defense Grid - App controller (DOM rendering, state machine, timer).
 * Depends on i18n.js and game-core.js being loaded first.
 *
 * Mechanics dispatch per item (item.kind), mirroring vault-signature-bench/app.js.
 */

(function () {
  "use strict";

  const MAX_TIME = 45;

  const STAGES = [
    { key: "s1", nameKey: "stage1Name", items: STAGE1_INJECTION },
    { key: "s2", nameKey: "stage2Name", items: STAGE2_XSS_CONTEXT },
    { key: "s3", nameKey: "stage3Name", items: STAGE3_CSRF },
    { key: "s4", nameKey: "stage4Name", items: STAGE4_ACCESS_CONTROL },
  ];

  const state = {
    lang: resolveLanguage(),
    player: { name: "", id: "" },
    stageIndex: 0,
    itemIndex: 0,
    timeLeft: MAX_TIME,
    timerHandle: null,
    submitted: false,
    stageResults: { s1: [], s2: [], s3: [], s4: [] },
  };

  const el = (id) => document.getElementById(id);

  // -------------------------------------------------------------------
  // i18n wiring
  // -------------------------------------------------------------------

  function applyStaticI18n() {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.getAttribute("data-i18n"), state.lang);
    });
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === state.lang);
    });
    document.documentElement.setAttribute("lang", state.lang);
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    el(id).classList.add("active");
  }

  // -------------------------------------------------------------------
  // Timer
  // -------------------------------------------------------------------

  function startTimer() {
    stopTimer();
    state.timeLeft = MAX_TIME;
    updateTimerUI();
    state.timerHandle = setInterval(() => {
      state.timeLeft -= 1;
      updateTimerUI();
      if (state.timeLeft <= 0) {
        stopTimer();
        if (!state.submitted) handleSubmit(true);
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerHandle) {
      clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function updateTimerUI() {
    el("timeLeftValue").textContent = Math.max(0, state.timeLeft) + "s";
    const ratio = Math.max(0, state.timeLeft / MAX_TIME);
    const fill = el("urgencyFill");
    fill.style.width = ratio * 100 + "%";
    fill.classList.toggle("urgency-critical", ratio < 0.3);
  }

  // -------------------------------------------------------------------
  // Generic choice-group helpers
  // -------------------------------------------------------------------

  function makeChoiceGroup(groupName, options, opts) {
    const multi = !!(opts && opts.multi);
    const maxSelect = opts && opts.maxSelect;
    const selectionOrder = [];
    const wrap = document.createElement("div");
    wrap.className = "choice-group";
    wrap.dataset.group = groupName;
    wrap.dataset.multi = multi ? "1" : "0";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.dataset.value = opt.value;
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        if (state.submitted) return;
        if (multi) {
          if (btn.classList.contains("active")) {
            btn.classList.remove("active");
            const idx = selectionOrder.indexOf(opt.value);
            if (idx >= 0) selectionOrder.splice(idx, 1);
          } else {
            if (maxSelect && selectionOrder.length >= maxSelect) {
              const oldestValue = selectionOrder.shift();
              const oldestBtn = wrap.querySelector(`.choice-btn[data-value="${CSS.escape(oldestValue)}"]`);
              if (oldestBtn) oldestBtn.classList.remove("active");
            }
            btn.classList.add("active");
            selectionOrder.push(opt.value);
          }
        } else {
          wrap.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        }
        if (opts && opts.onChange) opts.onChange();
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function readSingle(groupEl) {
    if (!groupEl) return null;
    const active = groupEl.querySelector(".choice-btn.active");
    return active ? active.dataset.value : null;
  }

  function readMulti(groupEl) {
    if (!groupEl) return [];
    return Array.from(groupEl.querySelectorAll(".choice-btn.active")).map((b) => b.dataset.value);
  }

  function fieldBlock(labelText) {
    const block = document.createElement("div");
    block.className = "field-block";
    const label = document.createElement("p");
    label.className = "field-block-label";
    label.textContent = labelText;
    block.appendChild(label);
    return block;
  }

  function bonusBlock(item, area) {
    if (!item.bonusQuestion) return;
    const block = fieldBlock(bi(item.bonusQuestion.prompt, state.lang));
    block.appendChild(
      makeChoiceGroup("bonus", shuffle(item.bonusQuestion.options).map((o) => ({ value: o.id, label: bi(o, state.lang) })))
    );
    area.appendChild(block);
  }

  // -------------------------------------------------------------------
  // Kind: layered_defense (Stage 1 injection, Stage 3 CSRF)
  // -------------------------------------------------------------------

  const LAYER_DICTS = { s1: INJECTION_DEFENSE_LAYER, s3: CSRF_DEFENSE_LAYER };

  function layerDictForStage() {
    return LAYER_DICTS[currentStage().key];
  }

  function renderLayeredDefense(item) {
    const area = el("answerArea");
    area.innerHTML = "";

    const identifyBlock = fieldBlock(bi(item.identifyPrompt, state.lang));
    identifyBlock.appendChild(
      makeChoiceGroup("identify", shuffle(item.identifyOptions).map((o) => ({ value: o.id, label: bi(o, state.lang) })))
    );
    area.appendChild(identifyBlock);

    const dict = layerDictForStage();
    const layerOptions = item.layerOptions.map((k) => ({ value: k, label: bi(dict[k], state.lang) }));
    const layerBlock = fieldBlock(
      state.lang === "th" ? "เลือกชั้นป้องกัน 2 ข้อที่ลดความเสี่ยงคนละมิติ" : "Choose 2 layers that reduce the risk on different dimensions"
    );
    layerBlock.appendChild(makeChoiceGroup("layers", layerOptions, { multi: true, maxSelect: 2 }));
    area.appendChild(layerBlock);

    const finalBlock = fieldBlock(
      state.lang === "th" ? "ข้อใดถูกต้องที่สุด" : "Which statement is most accurate?"
    );
    finalBlock.appendChild(
      makeChoiceGroup("final", shuffle(item.finalOptions).map((f) => ({ value: f.id, label: bi(f, state.lang) })))
    );
    area.appendChild(finalBlock);
  }

  function collectLayeredDefense() {
    const area = el("answerArea");
    const identifyId = readSingle(area.querySelector('[data-group="identify"]'));
    const layers = readMulti(area.querySelector('[data-group="layers"]'));
    const finalId = readSingle(area.querySelector('[data-group="final"]'));
    return { identifyId, layers, finalId, complete: !!identifyId && layers.length === 2 && !!finalId };
  }

  // -------------------------------------------------------------------
  // Kind: tool_select (Stage 2 XSS context)
  // -------------------------------------------------------------------

  function renderToolSelect(item) {
    const area = el("answerArea");
    area.innerHTML = "";

    const options = shuffle(item.options).map((k) => ({ value: k, label: bi(XSS_CONTEXT[k], state.lang) }));
    const block = fieldBlock(state.lang === "th" ? "จัดกลุ่มเป็น output context ใด" : "Which output context does this belong to?");
    block.appendChild(makeChoiceGroup("choice", options));
    area.appendChild(block);

    bonusBlock(item, area);
  }

  function collectToolSelect(item) {
    const area = el("answerArea");
    const choice = readSingle(area.querySelector('[data-group="choice"]'));
    const bonusId = item.bonusQuestion ? readSingle(area.querySelector('[data-group="bonus"]')) : null;
    return { choice, bonusId, complete: !!choice && (item.bonusQuestion ? !!bonusId : true) };
  }

  // -------------------------------------------------------------------
  // Kind: authorization (Stage 4 broken access control)
  // -------------------------------------------------------------------

  function renderAuthorization(item) {
    el("scenarioCard").hidden = false;
    el("itemTitle").textContent = "";
    const labelRequest = state.lang === "th" ? "คำร้อง" : "Request";
    const labelSubject = "Subject";
    const labelObject = "Object";
    el("itemScenario").textContent =
      `${labelRequest}: ${bi(item.request, state.lang)}  |  ${labelSubject}: ${bi(item.subject, state.lang)}  |  ${labelObject}: ${bi(item.object, state.lang)}`;

    const area = el("answerArea");
    area.innerHTML = "";

    const decisionBlock = fieldBlock(state.lang === "th" ? "ตัดสินใจ" : "Decision");
    decisionBlock.appendChild(
      makeChoiceGroup("decision", Object.keys(DECISION).map((k) => ({ value: k, label: bi(DECISION[k], state.lang) })))
    );
    area.appendChild(decisionBlock);

    const conditionBlock = fieldBlock(state.lang === "th" ? "Policy condition ที่ใช้ตัดสิน" : "The policy condition used to decide");
    conditionBlock.appendChild(
      makeChoiceGroup("condition", shuffle(item.conditionOptions).map((c) => ({ value: c.id, label: bi(c, state.lang) })))
    );
    area.appendChild(conditionBlock);

    bonusBlock(item, area);
  }

  function collectAuthorization(item) {
    const area = el("answerArea");
    const decision = readSingle(area.querySelector('[data-group="decision"]'));
    const conditionId = readSingle(area.querySelector('[data-group="condition"]'));
    const bonusId = item.bonusQuestion ? readSingle(area.querySelector('[data-group="bonus"]')) : null;
    return { decision, conditionId, bonusId, complete: !!decision && !!conditionId && (item.bonusQuestion ? !!bonusId : true) };
  }

  const RENDERERS = {
    layered_defense: renderLayeredDefense,
    tool_select: renderToolSelect,
    authorization: renderAuthorization,
  };
  const COLLECTORS = {
    layered_defense: collectLayeredDefense,
    tool_select: collectToolSelect,
    authorization: collectAuthorization,
  };
  const SCORERS = {
    layered_defense: scoreLayeredDefense,
    tool_select: scoreToolSelect,
    authorization: scoreAuthorization,
  };

  // -------------------------------------------------------------------
  // Stage flow
  // -------------------------------------------------------------------

  function currentStage() {
    return STAGES[state.stageIndex];
  }

  function currentItem() {
    return currentStage().items[state.itemIndex];
  }

  function renderItem() {
    state.submitted = false;
    const stage = currentStage();
    const item = currentItem();

    el("stageNumber").textContent = String(state.stageIndex + 1);
    el("stageName").textContent = t(stage.nameKey, state.lang);
    el("itemProgress").textContent =
      (state.lang === "th" ? "ข้อ " : "Item ") + (state.itemIndex + 1) + " / " + stage.items.length;

    if (item.kind === "tool_select") {
      el("scenarioCard").hidden = false;
      el("itemTitle").textContent = "";
      el("itemScenario").textContent = bi(item.prompt, state.lang);
    } else if (item.kind !== "authorization") {
      el("scenarioCard").hidden = false;
      el("itemTitle").textContent = item.title ? bi(item.title, state.lang) : "";
      el("itemScenario").textContent = item.scenario ? bi(item.scenario, state.lang) : "";
    }
    // 'authorization' kind sets scenarioCard content itself in renderAuthorization().

    RENDERERS[item.kind](item);

    el("feedbackBox").hidden = true;
    el("submitBtn").hidden = false;
    el("nextBtn").hidden = true;

    startTimer();
  }

  function isLastItemOfStage() {
    return state.itemIndex >= currentStage().items.length - 1;
  }

  function isLastStage() {
    return state.stageIndex >= STAGES.length - 1;
  }

  function handleSubmit(timedOut) {
    if (state.submitted) return;
    stopTimer();
    state.submitted = true;

    const stage = currentStage();
    const item = currentItem();
    const answer = COLLECTORS[item.kind](item);

    if (!timedOut && !answer.complete) {
      state.submitted = false;
      startTimer();
      showIncompleteHint();
      return;
    }

    const result = SCORERS[item.kind](item, answer);
    state.stageResults[stage.key].push(result.ratio);

    showFeedback(item, result);

    el("submitBtn").hidden = true;
    const nextBtn = el("nextBtn");
    nextBtn.hidden = false;
    const isFinalItem = isLastItemOfStage() && isLastStage();
    nextBtn.textContent = t(isFinalItem ? "seeResultsButton" : "nextButton", state.lang);
  }

  function showIncompleteHint() {
    const box = el("feedbackBox");
    box.hidden = false;
    box.classList.add("hint");
    box.classList.remove("warning");
    el("feedbackHeadline").textContent =
      state.lang === "th" ? "กรอกคำตอบให้ครบทุกส่วนก่อนส่ง" : "Fill in every part of the answer before submitting.";
    el("feedbackExplanation").textContent = "";
    setTimeout(() => {
      box.hidden = true;
      box.classList.remove("hint");
    }, 1800);
  }

  function showFeedback(item, result) {
    const box = el("feedbackBox");
    box.hidden = false;
    box.classList.remove("hint", "warning");

    const pct = Math.round(result.ratio * 100);
    el("feedbackHeadline").textContent =
      (state.lang === "th" ? "ความแม่นยำของข้อนี้: " : "Accuracy for this item: ") + pct + "%";
    el("feedbackExplanation").textContent = item.explanation ? bi(item.explanation, state.lang) : "";
  }

  function goToNext() {
    if (!isLastItemOfStage()) {
      state.itemIndex += 1;
      renderItem();
      return;
    }
    if (!isLastStage()) {
      state.stageIndex += 1;
      state.itemIndex = 0;
      renderItem();
      return;
    }
    showResults();
  }

  // -------------------------------------------------------------------
  // Results & certificate
  // -------------------------------------------------------------------

  function average(list) {
    if (!list.length) return 0;
    return (list.reduce((a, b) => a + b, 0) / list.length) * 100;
  }

  function showResults() {
    stopTimer();
    const stageAccuracies = {
      s1: average(state.stageResults.s1),
      s2: average(state.stageResults.s2),
      s3: average(state.stageResults.s3),
      s4: average(state.stageResults.s4),
    };
    const outcome = evaluateLearningOutcome(stageAccuracies);
    state.lastOutcome = outcome;

    el("rankBadge").textContent = outcome.badge;
    el("rankTitle").textContent = bi(outcome.title, state.lang);
    el("rankDescription").textContent = bi(outcome.description, state.lang);
    el("overallAccuracyValue").textContent = Math.round(outcome.accuracy) + "%";

    const breakdown = el("stageBreakdown");
    breakdown.innerHTML = "";
    STAGES.forEach((stage) => {
      const row = document.createElement("div");
      row.className = "breakdown-row";
      const label = document.createElement("span");
      label.textContent = t(stage.nameKey, state.lang);
      const value = document.createElement("span");
      value.className = "mono";
      value.textContent = Math.round(stageAccuracies[stage.key]) + "%";
      row.appendChild(label);
      row.appendChild(value);
      breakdown.appendChild(row);
    });

    showScreen("screen-results");
  }

  function simpleHash(str) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
  }

  function openCertificate() {
    const dateStr = new Date().toISOString().slice(0, 10);
    el("certName").textContent = state.player.name;
    el("certId").textContent = state.player.id;
    el("certDate").textContent = dateStr;
    el("certRankLabel").textContent = state.lang === "th" ? "ตำแหน่ง" : "Rank";
    el("certRankValue").textContent = bi(state.lastOutcome.title, state.lang);
    el("certAccuracy").textContent = Math.round(state.lastOutcome.accuracy) + "%";
    el("certSignature").textContent = simpleHash(
      `${state.player.name}|${state.player.id}|${Math.round(state.lastOutcome.accuracy)}|${dateStr}`
    );
    el("certModal").hidden = false;
  }

  // -------------------------------------------------------------------
  // Wiring
  // -------------------------------------------------------------------

  function resetGame() {
    state.stageIndex = 0;
    state.itemIndex = 0;
    state.stageResults = { s1: [], s2: [], s3: [], s4: [] };
    el("stageIndicator").hidden = true;
    showScreen("screen-start");
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyStaticI18n();

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lang = setLanguage(btn.getAttribute("data-lang"));
        applyStaticI18n();
        const activeScreen = document.querySelector(".screen.active");
        if (activeScreen && activeScreen.id === "screen-stage") {
          renderItem();
        } else if (activeScreen && activeScreen.id === "screen-results") {
          showResults();
        }
      });
    });

    el("startForm").addEventListener("submit", (e) => {
      e.preventDefault();
      state.player.name = el("playerName").value.trim();
      state.player.id = el("playerId").value.trim();
      if (!state.player.name || !state.player.id) return;
      el("stageIndicator").hidden = false;
      showScreen("screen-stage");
      renderItem();
    });

    el("submitBtn").addEventListener("click", () => handleSubmit(false));
    el("nextBtn").addEventListener("click", goToNext);
    el("playAgainBtn").addEventListener("click", resetGame);
    el("certBtn").addEventListener("click", openCertificate);
    el("certCloseBtn").addEventListener("click", () => {
      el("certModal").hidden = true;
    });
    el("certPrintBtn").addEventListener("click", () => window.print());
  });
})();
