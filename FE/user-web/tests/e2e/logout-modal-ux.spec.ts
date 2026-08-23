import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("logout modal UX", () => {
  test("opens the logout confirm modal with the shared modal transition", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app");
    await page.getByRole("button", { name: "모바일QA사용자" }).click();
    await page.getByRole("menuitem", { exact: true, name: "로그아웃" }).click();

    const logoutDialog = page.getByRole("dialog");
    await expect(
      logoutDialog.getByRole("heading", {
        exact: true,
        name: "계정에서 로그아웃하시겠습니까?",
      }),
    ).toBeVisible();
    await expect(logoutDialog).toHaveClass(/transition-all/);
    await expect(logoutDialog).toHaveClass(/duration-300/);

    await logoutDialog.getByRole("button", { exact: true, name: "취소" }).click();
    await expect(logoutDialog).toBeHidden();
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});
