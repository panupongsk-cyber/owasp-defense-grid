# Instructor Guide: OWASP Defense Grid

This guide covers learning alignment, mechanics, and classroom delivery for **OWASP Defense
Grid**, built for Chapter 9 (Web Application Attacks) of 305331/316331 Computer and Information
Security.

---

## 1. Educational Alignment

| MLO | After this stage, learners can | Stage |
|---|---|---|
| MLO9.1 | Explain the cause, impact, and defense principles of injection attacks | Stage 1: Injection |
| MLO9.2 | Analyze output context and choose the right XSS risk-reduction principle | Stage 2: Cross-Site Scripting |
| MLO9.3 | Analyze a state-changing request for sufficient evidence of user intent | Stage 3: CSRF |
| MLO9.4 | Analyze an access request for broken-access-control or IDOR conditions | Stage 4: Broken Access Control |

All scenarios are synthetic and reuse the Student Project Portal case from the approved chapter
source (`textbook/lecture-notes/chapter-09/00-chapter.md`) — the project-search and advisor-search
injection cases, the project-name XSS rendering case, the contact-email CSRF case, and the
download-link/grade-edit/request-review access-control cases are the chapter's own worked examples
(several taken directly from its `ตรวจความเข้าใจ` exercises and its object-access-matrix table), not
new inventions.

---

## 2. The pattern that is not just "harder" scoring

**Stages 1 and 3 require exactly 2 defense layers on different dimensions, enforced by the UI.**
Reusing the capped multi-select from Control Architect and Vault & Signature Bench, selecting a
third layer evicts the first one chosen. This operationalizes the chapter's repeated point that a
single control is not enough and that input validation in particular "ไม่ควรถูกอ้างว่าแทน
parameterization ได้ทุกกรณี" (should never be claimed as a full replacement for parameterization) —
students who reach for validation alongside validation-adjacent choices will find the pair scores
only partial credit, since both address the same dimension of the risk.

**Stage 4's bonus question is a direct IDOR check.** The download-link item asks explicitly whether
hiding a UI element is ever a substitute for a server-side authorization check — the chapter's own
answer ("เป็นเพียงการออกแบบ UI ไม่ใช่ authorization") is the only credited option.

## 3. Stage Mechanics

### Stage 1: Injection (2 items)
Given a data flow (user input → application builds a data-store request → results displayed),
identify which step is the data-to-interpreter path, choose 2 defense layers from
parameterization / input validation / least-privilege backend account / careful error handling that
reduce risk on different dimensions, then answer why input validation alone is not a full
replacement for parameterization.

### Stage 2: Cross-Site Scripting (3 items)
Classify three rendering positions (plain paragraph text, a link's title attribute, part of a URL)
into their output context — HTML text, attribute, or URL — then answer why input validation alone
cannot solve every context (each needs its own encoding).

### Stage 3: CSRF (1 item)
Given a state-changing request backed only by a session cookie, identify what evidence of user
intent is still missing, choose 2 defense layers (from CSRF token / Origin-Referer check /
SameSite / an explicit confirmation flow) that address different dimensions, then explain how CSRF
differs from credential theft.

### Stage 4: Broken Access Control / IDOR (3 items)
For each of the chapter's own three request/subject/object cases (a project file download outside
one's group, a grade edit outside one's course, reviewing another student's topic-change request),
decide allow/deny and identify the actual policy condition — not a proxy like "is the UI element
hidden" or "does the subject know the identifier." The first item adds the IDOR bonus question
described above.

---

## 4. Bilingual Use

Every scenario and UI string ships in Thai and English. Use the toggle in the top bar, or link
directly with `?lang=th` (305331 sections) or `?lang=en` (316331 sections) so each course's portal
entry point opens in its own default language. Switching language mid-item re-renders that item
fresh (a minor trade-off to keep the toggle simple); it never affects scores already recorded for
earlier items.

---

## 5. Classroom Delivery Strategies

### Option A: In-Class Icebreaker (10–15 minutes)
Run individually at the start of the Web Application Security week, before presenting the formal
OWASP Top 10 definitions. Debrief by asking which two-layer choice students found hardest to
justify, and why picking two controls that address the same dimension isn't real defense in depth.

### Option B: Competitive Score Attack (20 minutes)
Students race for points, which combine per-item accuracy with a speed bonus. Award the top three
"OWASP Defense Grid" ranks. The Stage 4 IDOR bonus question tends to separate students who still
think a hidden UI element is a security control from those who have internalized server-side
enforcement.

### Option C: Assessment & Evidence Collection
After finishing, students click "Generate certificate" to produce a one-page summary (name, ID,
date, rank, overall accuracy, and a verification signature) that they print or save as PDF and
submit with their chapter worksheet.
