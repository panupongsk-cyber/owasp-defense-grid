# OWASP Defense Grid

An interactive, bilingual (Thai/English) web-based cybersecurity learning game for **Chapter 9:
Web Application Attacks** (305331/316331, Naresuan University). Players audit the same Student
Project Portal case used across the 305331 textbook through Injection, Cross-Site Scripting (XSS),
CSRF, and Broken Access Control / IDOR — the chapter's own four attack classes, each analyzed at
the point in the web flow where it actually goes wrong (data interpretation, browser rendering,
missing evidence of intent, or unenforced policy).

## Features

- **4 stages, one per MLO (9.1–9.4)**: identify the data-to-interpreter path and build a two-layer
  injection defense; classify output contexts for XSS; identify missing evidence of user intent and
  build a two-layer CSRF defense; and judge allow/deny access-control requests including an
  IDOR-flavored case.
- **Bilingual by design**: every scenario, option, and UI label ships as `{ th, en }` pairs, same
  technical pattern as the four existing new games. A toggle in the top bar switches instantly;
  `?lang=th` or `?lang=en` sets the starting language.
- **A capped multi-select reused from Control Architect and Vault & Signature Bench**: Stages 1 and
  3 require choosing exactly 2 defense layers that reduce risk on different dimensions — picking a
  third bumps the oldest choice out (first-in-first-out), so the chapter's own "two layers, two
  different parts of the risk" framing is enforced by the UI itself.
- **Principle-level content only**: matching the chapter's own explicit framing ("ไม่มีคำสั่ง
  ขั้นตอนโจมตี หรือ payload สำหรับใช้กับระบบจริง"), every scenario stays at the level of what data
  flows where and what a service must check — no attack payloads, exploit steps, or operational
  instructions appear anywhere in this game.
- **Pure client-side code**: vanilla HTML, CSS, and JS. No build step, no backend, no analytics
  wiring.

## Structure

```
owasp-defense-grid/
├── index.html         # Shell: start screen, stage screen, results screen, certificate modal
├── styles.css         # "Grid" dark-crimson theme
├── i18n.js            # UI chrome strings (TH/EN) and language resolution (?lang=, localStorage)
├── game-core.js       # Scenario bank, scoring logic, learning-outcome evaluator (bilingual data)
├── app.js             # DOM controller, state machine, timer, per-item-kind renderers
├── game-core.test.js  # Unit test verifying scenario data and every scoring rule
└── teacher-guide.md   # CLO/MLO mapping and classroom delivery options
```

## How to Play

1. Start a local server from this folder:
   ```bash
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000` (or `http://localhost:8000?lang=th` to start in Thai).

## Run Tests

Verify scenario data integrity and scoring logic:

```bash
node game-core.test.js
```
