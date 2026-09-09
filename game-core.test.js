/**
 * OWASP Defense Grid Game Unit Tests - Lightweight Node-native verification script
 */

const assert = require("assert");
const {
  STAGE1_INJECTION,
  STAGE2_XSS_CONTEXT,
  STAGE3_CSRF,
  STAGE4_ACCESS_CONTROL,
  calculateScore,
  scoreLayeredDefense,
  scoreToolSelect,
  scoreAuthorization,
  evaluateLearningOutcome,
} = require("./game-core.js");

console.log("=========================================");
console.log("RUNNING OWASP DEFENSE GRID GAME CORE TESTS...");
console.log("=========================================");

try {
  // Test 1: Scenario bank integrity and bilingual coverage
  console.log("Test 1: Verifying scenario bank structure and bilingual fields...");
  assert.strictEqual(STAGE1_INJECTION.length, 2, "Stage 1 should have exactly 2 injection scenarios.");
  assert.strictEqual(STAGE2_XSS_CONTEXT.length, 3, "Stage 2 should have exactly 3 XSS context items.");
  assert.strictEqual(STAGE3_CSRF.length, 1, "Stage 3 should have exactly 1 CSRF scenario.");
  assert.strictEqual(STAGE4_ACCESS_CONTROL.length, 3, "Stage 4 should have exactly 3 authorization requests.");

  [...STAGE1_INJECTION, ...STAGE3_CSRF].forEach((item) => {
    assert.strictEqual(item.correctPair.length, 2, `Layered-defense item ${item.id} must name exactly 2 correct layers.`);
    const correctIdentify = item.identifyOptions.filter((o) => o.correct).length;
    assert.strictEqual(correctIdentify, 1, `Layered-defense item ${item.id} must have exactly one correct identify option.`);
  });
  console.log("✔ Scenario bank verified successfully.");

  // Test 2: Score calculation logic (shared speed-bonus formula)
  console.log("Test 2: Verifying calculateScore speed-bonus rules...");
  assert.strictEqual(calculateScore(100, 0, 45), 150, "Zero elapsed time should reward maximum points + speed bonus.");
  assert.strictEqual(calculateScore(100, 45, 45), 50, "Reaching the time limit should reward the minimum floor points.");
  console.log("✔ Score calculations verified successfully.");

  // Test 3: Stage 1/3 layered-defense scoring
  console.log("Test 3: Verifying layered-defense scoring (injection and CSRF)...");
  const s1item = STAGE1_INJECTION[0];
  const correctIdentify1 = s1item.identifyOptions.find((o) => o.correct);
  const correctFinal1 = s1item.finalOptions.find((f) => f.correct);
  const s1Perfect = scoreLayeredDefense(s1item, { identifyId: correctIdentify1.id, layers: s1item.correctPair, finalId: correctFinal1.id });
  assert.strictEqual(s1Perfect.ratio, 1, "Correct identify, correct pair, and correct final answer should score a perfect ratio.");
  const s1WrongIdentify = scoreLayeredDefense(s1item, { identifyId: "USER_INPUT", layers: s1item.correctPair, finalId: correctFinal1.id });
  assert.ok(s1WrongIdentify.ratio < s1Perfect.ratio, "A wrong identify answer should score lower than a perfect answer.");
  const s1OnePairOnly = scoreLayeredDefense(s1item, { identifyId: correctIdentify1.id, layers: [s1item.correctPair[0], "INPUT_VALIDATION"], finalId: correctFinal1.id });
  assert.ok(s1OnePairOnly.ratio < s1Perfect.ratio, "Getting only one of the two correct layers should score lower than a perfect answer.");

  const s3item = STAGE3_CSRF[0];
  const correctIdentify3 = s3item.identifyOptions.find((o) => o.correct);
  const correctFinal3 = s3item.finalOptions.find((f) => f.correct);
  const s3Perfect = scoreLayeredDefense(s3item, { identifyId: correctIdentify3.id, layers: s3item.correctPair, finalId: correctFinal3.id });
  assert.strictEqual(s3Perfect.ratio, 1, "The CSRF item should also score a perfect ratio when everything is correct.");
  console.log("✔ Layered-defense scoring verified successfully.");

  // Test 4: Stage 2 XSS context-classification scoring
  console.log("Test 4: Verifying XSS context-classification scoring...");
  const s2item1 = STAGE2_XSS_CONTEXT[0];
  assert.strictEqual(scoreToolSelect(s2item1, { choice: s2item1.correct }).ratio, 1, "Correct context choice with no bonus question should score a perfect ratio.");
  const s2item3 = STAGE2_XSS_CONTEXT[2];
  assert.ok(s2item3.bonusQuestion, "The URL-context item must carry a bonus question.");
  const correctBonus = s2item3.bonusQuestion.options.find((b) => b.correct);
  const s2Perfect = scoreToolSelect(s2item3, { choice: s2item3.correct, bonusId: correctBonus.id });
  assert.strictEqual(s2Perfect.ratio, 1, "Correct context choice and correct bonus answer should score a perfect ratio.");
  console.log("✔ XSS context-classification scoring verified successfully.");

  // Test 5: Stage 4 authorization scoring
  console.log("Test 5: Verifying Stage 4 authorization scoring...");
  const s4item1 = STAGE4_ACCESS_CONTROL[0];
  assert.ok(s4item1.bonusQuestion, "The IDOR-flavored download item must carry a bonus question.");
  const correctCondition1 = s4item1.conditionOptions.find((c) => c.correct);
  const correctBonus1 = s4item1.bonusQuestion.options.find((b) => b.correct);
  const s4Perfect1 = scoreAuthorization(s4item1, { decision: s4item1.correctDecision, conditionId: correctCondition1.id, bonusId: correctBonus1.id });
  assert.strictEqual(s4Perfect1.ratio, 1, "Correct decision, condition, and bonus answer should score a perfect ratio.");

  const s4item2 = STAGE4_ACCESS_CONTROL[1];
  assert.ok(!s4item2.bonusQuestion, "The grade-edit item should not carry a bonus question.");
  const correctCondition2 = s4item2.conditionOptions.find((c) => c.correct);
  const s4Perfect2 = scoreAuthorization(s4item2, { decision: s4item2.correctDecision, conditionId: correctCondition2.id });
  assert.strictEqual(s4Perfect2.ratio, 1, "An item with no bonus question should still score a perfect ratio from decision + condition alone.");
  const s4WrongDecision = scoreAuthorization(s4item2, { decision: "ALLOW", conditionId: correctCondition2.id });
  assert.ok(s4WrongDecision.ratio < s4Perfect2.ratio, "Choosing the wrong allow/deny decision should score lower than a perfect answer.");
  console.log("✔ Stage 4 authorization scoring verified successfully.");

  // Test 6: Learning outcome mapping
  console.log("Test 6: Verifying evaluateLearningOutcome output classifications...");
  const perfect = evaluateLearningOutcome({ s1: 100, s2: 100, s3: 100, s4: 100 });
  assert.strictEqual(perfect.accuracy, 100);
  assert.strictEqual(perfect.title.en, "Chief Web Application Defense Officer");
  const zero = evaluateLearningOutcome({ s1: 0, s2: 0, s3: 0, s4: 0 });
  assert.strictEqual(zero.accuracy, 0);
  assert.strictEqual(zero.title.en, "Web Defense Trainee");
  console.log("✔ Learning outcomes mapping verified successfully.");

  console.log("\n=========================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY! [PASS]");
  console.log("=========================================");
  process.exit(0);
} catch (error) {
  console.error("\n❌ TEST SUITE FAILED:");
  console.error(error);
  process.exit(1);
}
