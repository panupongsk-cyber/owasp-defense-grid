/**
 * OWASP Defense Grid - Core Logic & Scenario Bank
 * 305331 / 316331 Computer and Information Security, Naresuan University
 * Chapter 9: Web Application Attacks (MLO9.1-9.4)
 *
 * Every scenario is synthetic and grounded in the Student Project Portal case used across
 * the 305331 textbook (see textbook/lecture-notes/chapter-09/00-chapter.md). Bilingual text
 * is stored as { th, en } pairs; UI chrome strings live separately in i18n.js. Content stays
 * at the principle level, matching the chapter's own framing: no attack payloads, exploit
 * steps, or operational instructions for a real system.
 *
 * Every item carries its own `kind`, dispatched by app.js, mirroring vault-signature-bench/.
 */

// ---------------------------------------------------------------------------
// Shared vocabularies
// ---------------------------------------------------------------------------

const DECISION = {
  ALLOW: { th: "Allow", en: "Allow" },
  DENY: { th: "Deny", en: "Deny" },
};

const XSS_CONTEXT = {
  HTML_TEXT: { th: "HTML text", en: "HTML text" },
  ATTRIBUTE: { th: "Attribute", en: "Attribute" },
  URL: { th: "URL", en: "URL" },
};

// ---------------------------------------------------------------------------
// Stage 1 (MLO9.1) - Injection: data-to-interpreter path + layered defense
// ---------------------------------------------------------------------------

const INJECTION_DEFENSE_LAYER = {
  PARAMETERIZATION: { th: "Parameterization", en: "Parameterization" },
  INPUT_VALIDATION: { th: "Input validation", en: "Input validation" },
  LEAST_PRIVILEGE_BACKEND: { th: "Least privilege ของบัญชี backend", en: "Least privilege for the backend account" },
  ERROR_HANDLING: { th: "Error handling ที่ไม่เปิดเผยรายละเอียด", en: "Error handling that avoids leaking detail" },
};

const STAGE1_INJECTION = [
  {
    id: "S1-1",
    kind: "layered_defense",
    title: { th: "ค้นหาโครงงาน", en: "Project search" },
    scenario: {
      th: "ผู้ใช้กรอกคำค้น → application สร้างคำขอไปยัง data store → แสดงผล",
      en: "The user enters a search term → the application builds a request to the data store → results are displayed.",
    },
    identifyOptions: [
      { id: "USER_INPUT", th: "จุดที่ผู้ใช้กรอกคำค้น", en: "Where the user enters the search term", correct: false },
      { id: "QUERY_CONSTRUCTION", th: "จุดที่ application สร้างคำขอไปยัง data store", en: "Where the application builds the request to the data store", correct: true },
      { id: "DISPLAY_RESULTS", th: "จุดที่แสดงผลลัพธ์", en: "Where the results are displayed", correct: false },
    ],
    identifyPrompt: {
      th: "ข้อใดคือ data-to-interpreter path ของ flow นี้",
      en: "Which point in this flow is the data-to-interpreter path?",
    },
    layerOptions: Object.keys(INJECTION_DEFENSE_LAYER),
    correctPair: ["PARAMETERIZATION", "LEAST_PRIVILEGE_BACKEND"],
    finalOptions: [
      {
        id: "F_VALIDATION_NOT_REPLACEMENT",
        th: "การตรวจ input มีประโยชน์ต่อกฎธุรกิจและคุณภาพข้อมูล แต่ไม่ควรถูกอ้างว่าแทน parameterization ได้ทุกกรณี",
        en: "Input validation helps with business rules and data quality, but should never be claimed as a full replacement for parameterization.",
        correct: true,
      },
      {
        id: "F_VALIDATION_ENOUGH",
        th: "การตรวจ input ที่ครบถ้วนเพียงพอแล้วโดยไม่ต้องแยกโครงสร้างคำสั่งจากค่าข้อมูล",
        en: "Thorough input validation is enough on its own, without separating command structure from data values.",
        correct: false,
      },
      {
        id: "F_LENGTH_CHECK_ENOUGH",
        th: "การจำกัดความยาวของคำค้นเพียงพอที่จะป้องกัน injection ได้",
        en: "Limiting the search term's length is enough to prevent injection.",
        correct: false,
      },
    ],
    explanation: {
      th: "ความหมายของคำสั่งเปลี่ยนได้ที่จุดสร้างคำขอไปยัง data store จึงเป็น data-to-interpreter path Parameterization ลดโอกาสสำเร็จโดยแยกโครงสร้างจากข้อมูล ส่วน least privilege ของบัญชี backend ลดผลกระทบหากยังมีข้อผิดพลาดหลงเหลือ — สองมิติที่ต่างกัน",
      en: "The command's meaning can change at the point where the request to the data store is built — that's the data-to-interpreter path. Parameterization reduces the likelihood of success by separating structure from data; least privilege for the backend account limits the impact if something still goes wrong — two different dimensions.",
    },
  },
  {
    id: "S1-2",
    kind: "layered_defense",
    title: { th: "ค้นหาอาจารย์ที่ปรึกษา", en: "Advisor search" },
    scenario: {
      th: "ผู้ใช้กรอกชื่ออาจารย์ → application สร้างคำขอไปยัง data store → แสดงรายชื่อที่ตรงกัน",
      en: "The user enters an advisor's name → the application builds a request to the data store → matching names are displayed.",
    },
    identifyOptions: [
      { id: "USER_INPUT", th: "จุดที่ผู้ใช้กรอกชื่ออาจารย์", en: "Where the user enters the advisor's name", correct: false },
      { id: "QUERY_CONSTRUCTION", th: "จุดที่ application สร้างคำขอไปยัง data store", en: "Where the application builds the request to the data store", correct: true },
      { id: "DISPLAY_RESULTS", th: "จุดที่แสดงรายชื่อที่ตรงกัน", en: "Where the matching names are displayed", correct: false },
    ],
    identifyPrompt: {
      th: "ข้อใดคือ data-to-interpreter path ของ flow นี้",
      en: "Which point in this flow is the data-to-interpreter path?",
    },
    layerOptions: Object.keys(INJECTION_DEFENSE_LAYER),
    correctPair: ["PARAMETERIZATION", "ERROR_HANDLING"],
    finalOptions: [
      {
        id: "F_VALIDATION_NOT_REPLACEMENT",
        th: "การตรวจ input มีประโยชน์ต่อกฎธุรกิจและคุณภาพข้อมูล แต่ไม่ควรถูกอ้างว่าแทน parameterization ได้ทุกกรณี",
        en: "Input validation helps with business rules and data quality, but should never be claimed as a full replacement for parameterization.",
        correct: true,
      },
      {
        id: "F_VALIDATION_ENOUGH",
        th: "การตรวจ input ที่ครบถ้วนเพียงพอแล้วโดยไม่ต้องแยกโครงสร้างคำสั่งจากค่าข้อมูล",
        en: "Thorough input validation is enough on its own, without separating command structure from data values.",
        correct: false,
      },
      {
        id: "F_NAME_FORMAT_ENOUGH",
        th: "การตรวจว่าชื่อมีเฉพาะตัวอักษรเพียงพอที่จะป้องกัน injection ได้",
        en: "Checking that the name contains only letters is enough to prevent injection.",
        correct: false,
      },
    ],
    explanation: {
      th: "หลักการเดียวกันใช้ได้: parameterization ลดโอกาสสำเร็จ ส่วน error handling ที่ไม่เปิดเผยรายละเอียดลดผลกระทบเมื่อเกิดข้อผิดพลาดที่ยังหลงเหลือ",
      en: "The same principle applies: parameterization reduces the likelihood of success, while error handling that avoids leaking detail limits the impact of any error that still occurs.",
    },
  },
];

// ---------------------------------------------------------------------------
// Stage 2 (MLO9.2) - XSS output-context classification
// ---------------------------------------------------------------------------

const STAGE2_XSS_CONTEXT = [
  {
    id: "S2-1",
    kind: "tool_select",
    prompt: {
      th: "ชื่อโครงงานที่แสดงอยู่ในย่อหน้าของหน้ารายการ",
      en: "The project name shown inside a paragraph on the list page",
    },
    options: ["HTML_TEXT", "ATTRIBUTE", "URL"],
    correct: "HTML_TEXT",
    explanation: {
      th: "ข้อความในย่อหน้าเป็น HTML text context ธรรมดา",
      en: "Text inside a paragraph is a plain HTML text context.",
    },
  },
  {
    id: "S2-2",
    kind: "tool_select",
    prompt: {
      th: "ชื่อโครงงานที่ใช้เป็น title attribute ของลิงก์",
      en: "The project name used as a link's title attribute",
    },
    options: ["HTML_TEXT", "ATTRIBUTE", "URL"],
    correct: "ATTRIBUTE",
    explanation: {
      th: "การอยู่ในเครื่องหมายคำพูดของ attribute ทำให้เป็น attribute context ที่ต้องการ encoding ต่างจากข้อความทั่วไป",
      en: "Sitting inside an attribute's quotes makes this an attribute context, which needs different encoding than plain text.",
    },
  },
  {
    id: "S2-3",
    kind: "tool_select",
    prompt: {
      th: "ลิงก์ไปยังหน้าเอกสารที่สร้างจากชื่อไฟล์",
      en: "A link to a document page built from a filename",
    },
    options: ["HTML_TEXT", "ATTRIBUTE", "URL"],
    correct: "URL",
    explanation: {
      th: "ข้อมูลที่ประกอบเป็นส่วนหนึ่งของ URL ต้องพิจารณาเป็น URL context โดยเฉพาะ",
      en: "Data that becomes part of a URL must be treated as its own URL context.",
    },
    bonusQuestion: {
      prompt: {
        th: "เหตุใด input validation เพียงอย่างเดียวไม่ตอบโจทย์ทุก context",
        en: "Why doesn't input validation alone solve every context?",
      },
      options: [
        {
          id: "B_CONTEXT_SPECIFIC_ENCODING",
          th: "เพราะแต่ละ output context ต้องการ encoding ที่ต่างกัน ไม่ใช่กฎเดียวที่ใช้ได้ทุกที่",
          en: "Because each output context needs its own encoding, not one rule that works everywhere.",
          correct: true,
        },
        {
          id: "B_VALIDATION_USELESS",
          th: "เพราะ input validation ไม่มีประโยชน์ต่อ XSS เลย",
          en: "Because input validation has no benefit against XSS at all.",
          correct: false,
        },
        {
          id: "B_CSP_REPLACES_VALIDATION",
          th: "เพราะ CSP ทำหน้าที่แทน input validation ได้ทั้งหมด",
          en: "Because CSP fully replaces the need for input validation.",
          correct: false,
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Stage 3 (MLO9.3) - CSRF evidence-of-intent + layered defense
// ---------------------------------------------------------------------------

const CSRF_DEFENSE_LAYER = {
  CSRF_TOKEN: { th: "CSRF token ที่ผูกกับ session/action", en: "A CSRF token bound to the session/action" },
  ORIGIN_REFERER_CHECK: { th: "ตรวจ Origin/Referer", en: "Checking Origin/Referer" },
  SAMESITE_COOKIE: { th: "Cookie attribute เช่น SameSite", en: "A cookie attribute such as SameSite" },
  EXPLICIT_CONFIRMATION_FLOW: { th: "ให้ผู้ใช้ยืนยันใน flow ที่ชัดเจน", en: "Having the user confirm in an explicit flow" },
};

const STAGE3_CSRF = [
  {
    id: "S3-1",
    kind: "layered_defense",
    title: { th: "เปลี่ยนอีเมลติดต่อ", en: "Changing the contact email" },
    scenario: {
      th: "คำขอเปลี่ยนอีเมลติดต่อมาพร้อม session cookie ที่ถูกต้อง แต่ไม่มีหลักฐานอื่นจากหน้า Portal ที่ผู้ใช้กำลังใช้อยู่",
      en: "A request to change the contact email arrives with a valid session cookie, but with no other evidence from the Portal page the user is actually on.",
    },
    identifyOptions: [
      {
        id: "SESSION_PROVES_INTENT",
        th: "Session cookie ที่ถูกต้องพิสูจน์ว่าผู้ใช้ตั้งใจทำ action นี้",
        en: "A valid session cookie proves the user intended this action.",
        correct: false,
      },
      {
        id: "SESSION_ONLY_PROVES_LOGIN",
        th: "Session cookie บอกเพียงว่า browser มี session อยู่ ไม่ได้บอกว่าผู้ใช้ตั้งใจทำ action นี้ในบริบทนี้",
        en: "The session cookie only shows the browser has a session — it does not show the user intended this action in this context.",
        correct: true,
      },
      {
        id: "SESSION_MEANS_STOLEN",
        th: "Session cookie ที่มากับคำขอแปลว่า session ถูกขโมยไปแล้ว",
        en: "A session cookie arriving with the request means the session has already been stolen.",
        correct: false,
      },
    ],
    identifyPrompt: {
      th: "หลักฐานใดยังขาดต่อ user intent ในกรณีนี้",
      en: "What evidence of user intent is still missing here?",
    },
    layerOptions: Object.keys(CSRF_DEFENSE_LAYER),
    correctPair: ["CSRF_TOKEN", "EXPLICIT_CONFIRMATION_FLOW"],
    finalOptions: [
      {
        id: "F_CSRF_NOT_THEFT",
        th: "CSRF ใช้ credential ที่ browser ส่งให้อยู่แล้วโดยไม่ขโมย session หรืออ่าน response ส่วน credential theft คือการได้ credential ไปโดยตรง",
        en: "CSRF uses the credential the browser already sends, without stealing the session or reading the response; credential theft means obtaining the credential directly.",
        correct: true,
      },
      {
        id: "F_CSRF_IS_THEFT",
        th: "CSRF กับ credential theft เป็นเรื่องเดียวกัน เพียงแค่เรียกชื่อต่างกัน",
        en: "CSRF and credential theft are the same thing, just called by different names.",
        correct: false,
      },
      {
        id: "F_CSRF_READS_RESPONSE",
        th: "CSRF ทำให้ผู้โจมตีอ่าน response ของคำขอที่ถูกส่งไปได้โดยตรง",
        en: "CSRF lets the attacker directly read the response of the request that was sent.",
        correct: false,
      },
    ],
    explanation: {
      th: "Session cookie เพียงอย่างเดียวไม่ใช่หลักฐานเจตนา CSRF token เป็นหลักฐานหลัก ส่วนการยืนยันใน flow ที่ชัดเจนเพิ่มเจตนาที่ตรวจสอบได้อีกชั้นหนึ่ง คนละมิติจากการตรวจ Origin/Referer หรือ SameSite ที่เป็นชั้นเสริม",
      en: "A session cookie alone is not evidence of intent. A CSRF token is the primary evidence, while an explicit confirmation flow adds another independently checkable layer of intent — a different dimension from the supplementary Origin/Referer or SameSite checks.",
    },
  },
];

// ---------------------------------------------------------------------------
// Stage 4 (MLO9.4) - Broken Access Control / IDOR allow-deny decisions
// ---------------------------------------------------------------------------

const STAGE4_ACCESS_CONTROL = [
  {
    id: "S4-1",
    kind: "authorization",
    request: { th: "ดาวน์โหลดไฟล์โครงงาน", en: "Download a project file" },
    subject: { th: "นักศึกษาที่ไม่ใช่สมาชิกกลุ่มเจ้าของไฟล์", en: "A student who is not a member of the file's owning group" },
    object: { th: "ไฟล์โครงงานของกลุ่มอื่น", en: "Another group's project file" },
    correctDecision: "DENY",
    conditionOptions: [
      { id: "C_GROUP_OR_INSTRUCTOR", th: "subject เป็นสมาชิกกลุ่มหรือผู้สอนที่เกี่ยวข้องกับไฟล์นั้นหรือไม่", en: "Is the subject a member of the file's group, or the instructor responsible for it?", correct: true },
      { id: "C_LINK_HIDDEN", th: "หน้าเว็บซ่อนลิงก์ดาวน์โหลดไว้แล้วหรือไม่", en: "Did the web page already hide the download link?", correct: false },
      { id: "C_FILE_ID_GUESSABLE", th: "Identifier ของไฟล์เดายากเพียงใด", en: "How hard is the file's identifier to guess?", correct: false },
    ],
    bonusQuestion: {
      prompt: {
        th: "การซ่อนลิงก์ดาวน์โหลดในหน้าเว็บทำหน้าที่อะไรจริง ๆ",
        en: "What does hiding the download link on the page actually accomplish?",
      },
      options: [
        {
          id: "B_UI_ONLY",
          th: "เป็นเพียงการออกแบบ UI ไม่ใช่ authorization บริการต้องตรวจสิทธิ์อีกครั้งเสมอ",
          en: "It's only a UI design choice, not authorization — the service must still check permissions every time.",
          correct: true,
        },
        {
          id: "B_ENOUGH",
          th: "เพียงพอแล้ว เพราะผู้ใช้ทั่วไปจะไม่เห็นลิงก์",
          en: "It's enough, since an ordinary user won't see the link.",
          correct: false,
        },
        {
          id: "B_REPLACES_CHECK",
          th: "แทนที่การตรวจสิทธิ์ฝั่งบริการได้ ถ้า UI ซ่อนอย่างสมบูรณ์",
          en: "It replaces the server-side check, if the UI hides it completely.",
          correct: false,
        },
      ],
    },
  },
  {
    id: "S4-2",
    kind: "authorization",
    request: { th: "แก้ผลประเมิน", en: "Edit a grade" },
    subject: { th: "ผู้สอนของรายวิชาอื่น", en: "The instructor of a different course" },
    object: { th: "ผลของนักศึกษาในรายวิชาที่ตนไม่ได้รับผิดชอบ", en: "A grade in a course they are not responsible for" },
    correctDecision: "DENY",
    conditionOptions: [
      { id: "C_ROLE_AND_COURSE", th: "subject มี role ผู้สอนและรับผิดชอบรายวิชานั้นหรือไม่", en: "Does the subject hold the instructor role and responsibility for this specific course?", correct: true },
      { id: "C_IS_INSTRUCTOR_ANYWHERE", th: "subject เป็นผู้สอนของรายวิชาใดวิชาหนึ่งอยู่แล้วหรือไม่", en: "Is the subject already an instructor for some course, any course?", correct: false },
      { id: "C_GRADE_ALREADY_SET", th: "ผลประเมินนั้นถูกบันทึกไปแล้วหรือยัง", en: "Has the grade already been recorded?", correct: false },
    ],
  },
  {
    id: "S4-3",
    kind: "authorization",
    request: { th: "ดูคำร้องของผู้อื่น", en: "View another person's request" },
    subject: { th: "ผู้ช่วยสอนที่ไม่มีหน้าที่ตรวจคำร้องนั้น", en: "A teaching assistant not assigned to review that request" },
    object: { th: "คำร้องเปลี่ยนหัวข้อของนักศึกษาอีกกลุ่ม", en: "A topic-change request from a different student group" },
    correctDecision: "DENY",
    conditionOptions: [
      { id: "C_ASSIGNED_TO_REVIEW", th: "subject มีหน้าที่ตรวจคำร้องนั้นตามที่ได้รับมอบหมายหรือไม่", en: "Is the subject assigned to review that specific request?", correct: true },
      { id: "C_IS_TA", th: "subject มีบทบาทผู้ช่วยสอนอยู่แล้วหรือไม่", en: "Does the subject already hold the teaching-assistant role, generally?", correct: false },
      { id: "C_REQUEST_ID_KNOWN", th: "subject ทราบ identifier ของคำร้องนั้นหรือไม่", en: "Does the subject happen to know that request's identifier?", correct: false },
    ],
  },
];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreLayeredDefense(item, answer) {
  const identifyOption = item.identifyOptions.find((o) => o.id === answer.identifyId);
  const identifyRatio = identifyOption && identifyOption.correct ? 1 : 0;

  const selected = Array.isArray(answer.layers) ? answer.layers : [];
  const correctSelected = selected.filter((l) => item.correctPair.includes(l));
  let pairRatio = 0;
  if (selected.length === 2 && correctSelected.length === 2) pairRatio = 1;
  else if (correctSelected.length === 1) pairRatio = 0.5;

  const chosenFinal = item.finalOptions.find((f) => f.id === answer.finalId);
  const finalRatio = chosenFinal && chosenFinal.correct ? 1 : 0;

  return { ratio: 0.3 * identifyRatio + 0.4 * pairRatio + 0.3 * finalRatio };
}

function scoreToolSelect(item, answer) {
  const mainCorrect = answer.choice === item.correct;
  if (!item.bonusQuestion) {
    return { ratio: mainCorrect ? 1 : 0 };
  }
  const chosenBonus = item.bonusQuestion.options.find((b) => b.id === answer.bonusId);
  const bonusCorrect = !!(chosenBonus && chosenBonus.correct);
  return { ratio: (mainCorrect ? 0.6 : 0) + (bonusCorrect ? 0.4 : 0) };
}

function scoreAuthorization(item, answer) {
  const decisionCorrect = answer.decision === item.correctDecision;
  const chosenCondition = item.conditionOptions.find((c) => c.id === answer.conditionId);
  const conditionCorrect = !!(chosenCondition && chosenCondition.correct);

  let ratio;
  if (item.bonusQuestion) {
    const chosenBonus = item.bonusQuestion.options.find((b) => b.id === answer.bonusId);
    const bonusCorrect = !!(chosenBonus && chosenBonus.correct);
    ratio = (decisionCorrect ? 0.4 : 0) + (conditionCorrect ? 0.3 : 0) + (bonusCorrect ? 0.3 : 0);
  } else {
    ratio = (decisionCorrect ? 0.5 : 0) + (conditionCorrect ? 0.5 : 0);
  }
  return { ratio };
}

// ---------------------------------------------------------------------------
// Outcome evaluation
// ---------------------------------------------------------------------------

function evaluateLearningOutcome(stageAccuracies) {
  const values = Object.values(stageAccuracies);
  const overallAccuracy =
    values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

  let rank = {
    badge: "🕸️",
    title: { th: "ช่วงผลการฝึก: ต่ำกว่า 50%", en: "Practice band: below 50%" },
    description: {
      th: "ผลนี้สะท้อนความถูกต้องในชุดสถานการณ์ฝึกนี้เท่านั้น ลองเล่นซ้ำเพื่อฝึกแยก injection, XSS, CSRF และ broken access control ให้ชัดเจนขึ้น",
      en: "This result reflects accuracy in this local scenario set only; replay to practise distinguishing injection, XSS, CSRF, and broken access control.",
    },
  };

  if (overallAccuracy >= 90) {
    rank = {
      badge: "🛡️",
      title: { th: "ช่วงผลการฝึก: 90–100%", en: "Practice band: 90–100%" },
      description: {
        th: "ความถูกต้องสูงในชุดสถานการณ์ฝึกนี้ โดยยังไม่ใช่การรับรองความสามารถในการปฏิบัติงานจริง",
        en: "High accuracy in this local scenario set; it does not certify operational competence.",
      },
    };
  } else if (overallAccuracy >= 75) {
    rank = {
      badge: "🔍",
      title: { th: "ช่วงผลการฝึก: 75–89%", en: "Practice band: 75–89%" },
      description: {
        th: "ความถูกต้องดีในชุดสถานการณ์ฝึกนี้ ลองทบทวน defense in depth และ policy condition",
        en: "Good accuracy in this local scenario set; review defense in depth and the relevant policy conditions.",
      },
    };
  } else if (overallAccuracy >= 50) {
    rank = {
      badge: "🧩",
      title: { th: "ช่วงผลการฝึก: 50–74%", en: "Practice band: 50–74%" },
      description: {
        th: "มีความเข้าใจพื้นฐานในชุดสถานการณ์ฝึกนี้ ลองทบทวน attack class และเหตุที่ UI ที่ซ่อนไว้ไม่ใช่ authorization",
        en: "Some basic understanding in this local scenario set; review attack classes and why a hidden UI element is not authorization.",
      },
    };
  }

  return { accuracy: overallAccuracy, ...rank };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DECISION,
    XSS_CONTEXT,
    INJECTION_DEFENSE_LAYER,
    CSRF_DEFENSE_LAYER,
    STAGE1_INJECTION,
    STAGE2_XSS_CONTEXT,
    STAGE3_CSRF,
    STAGE4_ACCESS_CONTROL,
    scoreLayeredDefense,
    scoreToolSelect,
    scoreAuthorization,
    evaluateLearningOutcome,
  };
}
