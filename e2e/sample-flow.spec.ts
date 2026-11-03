import { expect, test } from "@playwright/test";

/** The flow tests start with both tours already seen; the tour has its own test below. */
test.beforeEach(async ({ page }, info) => {
  if (info.title.startsWith("tour")) return;
  await page.addInitScript(() => {
    localStorage.setItem("sip-ai-tour-setup", "seen");
    localStorage.setItem("sip-ai-tour-sip", "seen");
  });
});

/** The sample SIP from set-up to the reason line, with screenshots at each step (docs/screens/). */
test("sample SIP: replay to the setback, tap a guess, read the reason, ask a follow-up", async ({ page }, info) => {
  const shot = (name: string) => page.screenshot({ path: `docs/screens/${info.project.name}-${name}.png` });
  await page.goto("/");
  await expect(page.getByTestId("strip")).toContainText("Not made by or linked to Groww");
  await shot("1-setup");

  await page.getByTestId("sample").click();
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
  await expect(page.getByTestId("reason")).toContainText("11.3%");
  await expect(page.getByTestId("quality-tag")).toBeVisible();
  await shot("4-helper-reason");

  await page.getByTestId("ask-more").click();
  await page.getByRole("button", { name: "Should I switch to another fund?" }).click();
  await expect(page.getByTestId("reply-tag").last()).toContainText("Safe answer");
  await page.getByRole("button", { name: "What happens if I stop now?" }).click();
  await expect(page.getByTestId("reply")).toHaveCount(2, { timeout: 30_000 });
  await shot("5-followup");

  await page.getByRole("button", { name: "Got it" }).click();
  await expect(page.getByTestId("reason-line")).toContainText("March 2026");
  await shot("6-reason-line");
});

test("Hindi: the helper card speaks Hindi", async ({ page }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "हिंदी" }).click();
  await page.getByTestId("sample").click();
  await page.getByTestId("skip").click();
  await page.getByTestId("guess-market").click();
  await expect(page.getByTestId("answer")).toContainText("आपने सही समझा।");
  await page.screenshot({ path: `docs/screens/${info.project.name}-7-hindi.png` });
});

test("tour: first visit spotlights each part, and it does not come back", async ({ page }, info) => {
  await page.goto("/");
  const tour = page.getByTestId("tour");
  await expect(tour).toBeVisible();
  await expect(tour).toContainText("A concept, not advice");
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
