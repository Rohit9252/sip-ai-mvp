import { expect, test } from "@playwright/test";

/** Every test starts having agreed to the notice (it has its own test); flow tests also skip the tours. */
test.beforeEach(async ({ page }, info) => {
  if (info.title.startsWith("consent")) return;
  await page.addInitScript(() => {
    localStorage.setItem("sip-ai-consent", JSON.stringify({ version: 1, acceptedAt: new Date().toISOString() }));
  });
  if (info.title.startsWith("tour")) return;
  await page.addInitScript(() => {
    localStorage.setItem("sip-ai-tour-setup", "seen");
    localStorage.setItem("sip-ai-tour-sip", "seen");
    localStorage.setItem("sip-ai-tour-helper-ask", "seen");
    localStorage.setItem("sip-ai-tour-helper-answer", "seen");
  });
});

/** The sample SIP from set-up to the reason line, with screenshots at each step (docs/screens/). */
test("sample SIP: replay to the setback, tap a guess, read the reason, ask a follow-up", async ({ page }, info) => {
  const shot = (name: string) => page.screenshot({ path: `docs/screens/${info.project.name}-${name}.png` });
  await page.goto("/");
  await expect(page.getByTestId("strip")).toContainText("Not made by or linked to Groww");
  await shot("1-setup");

  await page.getByTestId("sample").click();
  await expect(page.getByTestId("sample-picker")).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `docs/screens/${info.project.name}-1b-sample-picker.png` });
  await page.getByTestId("sample-amount-5000").click();
  await page.getByTestId("sample-start").click();
  await expect(page.getByTestId("month-badge")).toContainText("Month 1");
  await shot("2-sip-month-1");

  await page.getByTestId("skip").click();
  const helper = page.getByTestId("helper");
  await expect(helper).toBeVisible();
  await expect(page.getByTestId("ask")).toContainText("₹40,000");
  await expect(page.getByTestId("ask")).toContainText("₹35,785");
  await shot("3-helper-ask");

  await page.getByTestId("guess-fund").click();
  await expect(page.getByTestId("answer")).toContainText("This fall isn't just your fund.");
  // The answer's first line must be on screen, not scrolled away under the header (a phone bug we fixed).
  await page.waitForTimeout(800);
  await expect(page.getByTestId("answer").getByText("This fall isn't just your fund.")).toBeInViewport();
  await expect(page.getByTestId("reason")).toContainText("11.3%");
  await expect(page.getByTestId("quality-tag")).toBeVisible();
  await expect(page.getByTestId("cheer")).toContainText("You checked instead");
  await shot("4-helper-reason");

  await page.getByRole("button", { name: "Should I switch to another fund?" }).click();
  await expect(page.getByTestId("reply-tag").last()).toContainText("Safe answer");
  await page.getByRole("button", { name: "What happens if I stop now?" }).click();
  await expect(page.getByTestId("reply")).toHaveCount(2, { timeout: 30_000 });
  await shot("5-followup");

  await expect(page.getByTestId("learn")).toBeVisible();
  await page.getByTestId("got-it").click();
  await expect(page.getByTestId("reason-line")).toContainText("March 2026");
  await shot("6-reason-line");
});

test("Hindi: the helper card speaks Hindi", async ({ page }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "हिंदी" }).click();
  await page.getByTestId("sample").click();
  await page.getByTestId("sample-start").click();
  await page.getByTestId("skip").click();
  await page.getByTestId("guess-market").click();
  await expect(page.getByTestId("answer")).toContainText("आपने सही समझा।");
  await page.screenshot({ path: `docs/screens/${info.project.name}-7-hindi.png` });
});

test("tour: first visit spotlights each part, and it does not come back", async ({ page }, info) => {
  await page.goto("/");
  const tour = page.getByTestId("tour");
  await expect(tour).toBeVisible();
  await expect(tour).toContainText("A graduation project, not advice");
  await page.screenshot({ path: `docs/screens/${info.project.name}-0-tour-1.png` });
  await page.getByTestId("tour-next").click();
  await page.getByTestId("tour-next").click();
  await expect(tour).toContainText("Start with a real sample");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `docs/screens/${info.project.name}-0-tour-3.png` });
  await page.getByTestId("tour-next").click();
  await page.getByTestId("tour-next").click();
  await expect(tour).toBeHidden();

  await page.getByTestId("sample").click();
  await page.getByTestId("sample-start").click();
  await expect(tour).toBeVisible();
  await expect(tour).toContainText("Your money at a glance");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `docs/screens/${info.project.name}-0-tour-sip.png` });
  await page.getByTestId("tour-skip").click();
  await expect(tour).toBeHidden();

  await page.reload();
  await expect(page.getByTestId("sample")).toBeVisible();
  await expect(tour).toBeHidden();
});

test("manage: stop asks an optional reason and says nothing real changed; withdraw shows the exit load", async ({ page }, info) => {
  await page.goto("/");
  await page.getByTestId("sample").click();
  await page.getByTestId("sample-amount-5000").click();
  await page.getByTestId("sample-start").click();
  await page.getByTestId("skip").click();
  await page.getByTestId(info.project.name === "phone" ? "guess-market" : "guess-market").click();
  await page.getByTestId("got-it").click();

  await page.getByTestId("stop").click();
  await expect(page.getByTestId("manage")).toBeVisible();
  await page.waitForTimeout(450);
  await page.screenshot({ path: `docs/screens/${info.project.name}-8-manage.png` });
  await page.getByTestId("manage-stop").click();
  await page.getByTestId("reason-returns").click();
  await expect(page.getByTestId("manage")).toContainText("See what happened");
  await page.waitForTimeout(450);
  await page.screenshot({ path: `docs/screens/${info.project.name}-9-stop-reason.png` });
  await page.getByTestId("manage-confirm").click();
  await expect(page.getByTestId("manage-done")).toContainText("₹35,785");
  await page.getByRole("button", { name: "Back to my SIP" }).click();

  await page.getByTestId("withdraw").click();
  // All of Rs 35,785 in month 8: exit load about Rs 358, about Rs 35,427 in hand.
  await expect(page.getByTestId("manage")).toContainText("₹358");
  await expect(page.getByTestId("manage")).toContainText("₹35,427");
  await page.waitForTimeout(450);
  await page.screenshot({ path: `docs/screens/${info.project.name}-10-withdraw.png` });
  await page.getByTestId("withdraw-continue").click();
  await page.getByTestId("reason-money").click();
  await page.getByTestId("manage-confirm").click();
  await expect(page.getByTestId("manage-done")).toContainText("₹35,427");
});

test("sample at the default Rs 1,000: the same month-8 setback, in smaller rupees", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("sample").click();
  await page.getByTestId("sample-start").click();
  await page.getByTestId("skip").click();
  // Rs 1,000 a month: 8 instalments = Rs 8,000; value scales with the amount (about a fifth of Rs 35,785).
  await expect(page.getByTestId("ask")).toContainText("₹8,000");
  await expect(page.getByTestId("month-badge")).toContainText("Month 8");
});

test("consent: the first visit asks first, in any language, and the About popup reopens it", async ({ page }, info) => {
  await page.goto("/");
  const consent = page.getByTestId("consent");
  await expect(consent).toBeVisible();
  await expect(consent).toContainText("not investment advice");
  await expect(page.getByTestId("consent-start")).toBeDisabled();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `docs/screens/${info.project.name}-00-consent.png` });
  await page.getByTestId("consent-agree").check();
  await page.getByTestId("consent-start").click();
  await expect(consent).toBeHidden();
  // The setup tour starts after consent.
  await expect(page.getByTestId("tour")).toBeVisible();
  await page.getByTestId("tour-skip").click();
  await page.getByTestId("about").click();
  await expect(page.getByTestId("consent")).toContainText("You agreed on");
  await page.reload();
  await expect(page.getByTestId("consent")).toBeHidden();
});

test("helper: on a phone it can be closed and reopened from the helper button, and keeps the chat", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "the floating helper button is the phone layout");
  await page.goto("/");
  await page.getByTestId("sample").click();
  await page.getByTestId("sample-start").click();
  // Before the setback the button opens what the helper will do, with the basics.
  await page.getByTestId("helper-fab").click();
  await expect(page.getByTestId("helper-waiting")).toBeVisible();
  await page.getByTestId("helper-waiting").getByRole("button", { name: "Close" }).first().click();
  await page.getByTestId("skip").click();
  await page.getByTestId("guess-market").click();
  await expect(page.getByTestId("answer")).toContainText("You read it right.");
  await page.getByTestId("helper-close").click();
  await expect(page.getByTestId("helper")).toBeHidden();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "docs/screens/phone-11-helper-button.png" });
  await page.getByTestId("helper-fab").click();
  await expect(page.getByTestId("answer")).toContainText("You read it right.");
});

test("tour of the helper: it explains the question, then the answer, the questions and Got it", async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem("sip-ai-tour-setup", "seen");
    localStorage.setItem("sip-ai-tour-sip", "seen");
  });
  await page.goto("/");
  await page.getByTestId("sample").click();
  await page.getByTestId("sample-start").click();
  await page.getByTestId("skip").click();
  const tour = page.getByTestId("tour");
  await expect(tour).toContainText("Your helper steps in at the first fall");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `docs/screens/${info.project.name}-12-helper-tour-ask.png` });
  await page.getByTestId("tour-next").click();
  await expect(tour).toContainText("Tap what you think happened");
  await page.getByTestId("tour-next").click();
  await expect(tour).toBeHidden();
  await page.getByTestId("guess-market").click();
  await expect(tour).toContainText("What really moved your money", { timeout: 30_000 });
  await page.getByTestId("tour-next").click();
  await expect(tour).toContainText("Ask your own questions");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `docs/screens/${info.project.name}-13-helper-tour-chat.png` });
  await page.getByTestId("tour-next").click();
  await expect(tour).toContainText("Keep the reason with you");
  await page.getByTestId("tour-next").click();
  await expect(tour).toBeHidden();
});

test("helper: on desktop the same Your helper button brings the panel into focus", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "the side panel is the desktop layout");
  await page.goto("/");
  await page.getByTestId("sample").click();
  await page.getByTestId("sample-start").click();
  await page.getByTestId("helper-fab").click();
  await expect(page.getByTestId("helper-panel")).toBeFocused();
  await page.getByTestId("skip").first().click();
  await expect(page.getByTestId("helper")).toBeVisible();
});
