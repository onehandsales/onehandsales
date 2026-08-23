import { expect, test, type Locator } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("help modal UX", () => {
  test("opens five help sections in a centered compact modal", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app");
    await page.getByRole("button", { exact: true, name: "도움말" }).click();

    await expect(
      page.getByRole("menuitem", { exact: true, name: "사용 가이드" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { exact: true, name: "지원요청" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { exact: true, name: "에러신고" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { exact: true, name: "이용약관" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { exact: true, name: "개인정보" }),
    ).toBeVisible();

    await page.getByRole("menuitem", { exact: true, name: "사용 가이드" }).click();

    const helpDialog = page.getByRole("dialog", { name: "도움말" });
    await expect(helpDialog).toBeVisible();
    await expect(
      helpDialog.getByRole("heading", { exact: true, name: "사용 가이드" }),
    ).toBeVisible();
    await expectHelpDialogWidth(helpDialog);
    await expectHelpSidebarIconSize(
      helpDialog.getByRole("button", { exact: true, name: "사용 가이드" }),
    );
    await expect(page).toHaveURL(/\/app$/);
    await expect(
      page.getByRole("heading", { exact: true, name: "설정" }),
    ).toHaveCount(0);

    await helpDialog.getByRole("button", { exact: true, name: "개인정보" }).click();
    await expect(
      helpDialog.getByRole("heading", {
        exact: true,
        name: "개인정보 처리방침",
      }),
    ).toBeVisible();

    await helpDialog.getByRole("button", { exact: true, name: "지원요청" }).click();
    await expect(
      helpDialog.getByRole("heading", { exact: true, name: "지원요청" }),
    ).toBeVisible();
    await expect(
      helpDialog.getByRole("link", { exact: true, name: "이메일로 지원 요청" }),
    ).toHaveAttribute("href", /mailto:team@onehandsales\.com/);

    await helpDialog.getByRole("button", { exact: true, name: "에러신고" }).click();
    await expect(
      helpDialog.getByRole("heading", { exact: true, name: "에러신고" }),
    ).toBeVisible();
    await helpDialog
      .getByRole("button", { exact: true, name: "에러 신고하기" })
      .click();

    const errorDescription = helpDialog.getByLabel("에러 내용");
    const submitButton = helpDialog.getByRole("button", {
      exact: true,
      name: "신고하기",
    });
    await expect(errorDescription).toBeVisible({ timeout: 10000 });
    await expect(submitButton).toBeDisabled();
    await errorDescription.fill("짧아요");
    await expect(submitButton).toBeDisabled();
    await errorDescription.fill(
      "홈 화면에서 카드가 겹쳐 보이고 버튼이 눌리지 않아요.",
    );
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    await expect(
      helpDialog.getByText("신고가 접수되었어요. 문제를 빠르게 해결할게요."),
    ).toBeVisible();
    await expect(helpDialog).toBeHidden({ timeout: 3000 });

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

// 기능 : 도움말 모달이 520px 기준의 compact 폭으로 렌더링되는지 확인합니다.
async function expectHelpDialogWidth(dialog: Locator) {
  const width = await dialog.evaluate((node) =>
    Math.round(node.getBoundingClientRect().width),
  );

  expect(width).toBeGreaterThanOrEqual(500);
  expect(width).toBeLessThanOrEqual(522);
}

// 기능 : 도움말 모달 사이드바 아이콘이 앱 사이드바 기준 크기로 렌더링되는지 확인합니다.
async function expectHelpSidebarIconSize(button: Locator) {
  const size = await button.locator("svg").first().evaluate((node) => {
    const rect = node.getBoundingClientRect();

    return {
      height: Math.round(rect.height),
      width: Math.round(rect.width),
    };
  });

  expect(size).toEqual({ height: 20, width: 20 });
}
