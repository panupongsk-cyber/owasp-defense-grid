/**
 * OWASP Defense Grid - UI chrome strings and language resolution.
 *
 * Scenario/content bilingual text lives in game-core.js next to the data it labels. This
 * file only holds fixed interface chrome, shared by 305331 (Thai-first) and 316331
 * (English-only) through the same games-portal. Same technical pattern as the other new
 * games' i18n.js.
 */

const SUPPORTED_LANGS = ["th", "en"];
const DEFAULT_LANG = "en";
const LANG_STORAGE_KEY = "odg_lang";

function resolveLanguage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("lang");
    if (fromQuery && SUPPORTED_LANGS.includes(fromQuery)) {
      window.localStorage.setItem(LANG_STORAGE_KEY, fromQuery);
      return fromQuery;
    }
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch (e) {
    // localStorage or URLSearchParams unavailable (e.g. under Node for tests) - fall through.
  }
  return DEFAULT_LANG;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return DEFAULT_LANG;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (e) {
    // Ignore storage failures; the toggle still works for the current page view.
  }
  return lang;
}

const UI_STRINGS = {
  gameTitle: { th: "กริดป้องกันเว็บแอปพลิเคชัน", en: "OWASP Defense Grid" },
  gameSubtitle: {
    th: "วิเคราะห์ data flow, output context, เจตนาผู้ใช้ และ authorization สำหรับ Student Project Portal",
    en: "Analyze data flow, output context, user intent, and authorization for the Student Project Portal",
  },
  startPrompt: { th: "กรอกชื่อและรหัสนักศึกษาเพื่อเริ่ม", en: "Enter your name and student ID to begin" },
  nameLabel: { th: "ชื่อ-นามสกุล", en: "Full name" },
  idLabel: { th: "รหัสนักศึกษา", en: "Student ID" },
  startButton: { th: "เริ่มตรวจสอบ", en: "Start the audit" },
  stageLabel: { th: "ด่านที่", en: "Stage" },
  submitButton: { th: "ส่งคำตอบ", en: "Submit" },
  nextButton: { th: "ถัดไป", en: "Next" },
  seeResultsButton: { th: "ดูผลลัพธ์", en: "See results" },
  playAgainButton: { th: "เล่นอีกครั้ง", en: "Play again" },
  generateCertificateButton: { th: "ดูสรุปการฝึกในเบราว์เซอร์", en: "View local practice summary" },
  printButton: { th: "พิมพ์ / บันทึกสรุปการฝึก", en: "Print / Save practice summary" },
  closeButton: { th: "ปิด", en: "Close" },
  resultsTitle: { th: "สรุปผลการตรวจสอบ", en: "Grid audit summary" },
  localSummaryTitle: { th: "สรุปการฝึกในเบราว์เซอร์", en: "Local practice summary" },
  overallAccuracy: { th: "ความแม่นยำโดยรวม", en: "Overall accuracy" },
  stage1Name: { th: "ด่าน 1: Injection", en: "Stage 1: Injection" },
  stage2Name: { th: "ด่าน 2: Cross-Site Scripting", en: "Stage 2: Cross-Site Scripting" },
  stage3Name: { th: "ด่าน 3: CSRF", en: "Stage 3: CSRF" },
  stage4Name: { th: "ด่าน 4: Broken Access Control", en: "Stage 4: Broken Access Control" },
  certName: { th: "ชื่อ", en: "Name" },
  certId: { th: "รหัสนักศึกษา", en: "Student ID" },
  certDate: { th: "วันที่", en: "Date" },
  certSignature: { th: "ขอบเขตของสรุป", en: "Summary scope" },
  localSummaryBoundary: {
    th: "สร้างและกรอกข้อมูลในเบราว์เซอร์เท่านั้น ไม่ใช่หลักฐานยืนยันตัวตน การผ่านงาน ความสามารถ หรือการรับรองจากผู้สอน",
    en: "Browser-only and self-entered; not evidence of identity, completion, competency, or instructor verification.",
  },
  langToggleLabel: { th: "ภาษา", en: "Language" },
};

function t(key, lang) {
  const entry = UI_STRINGS[key];
  if (!entry) return key;
  return entry[lang] || entry[DEFAULT_LANG];
}

function bi(field, lang) {
  if (!field) return "";
  return field[lang] || field[DEFAULT_LANG] || "";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SUPPORTED_LANGS,
    DEFAULT_LANG,
    LANG_STORAGE_KEY,
    resolveLanguage,
    setLanguage,
    UI_STRINGS,
    t,
    bi,
  };
}
