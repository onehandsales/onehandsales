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
    const helpButton = page.getByRole("button", { exact: true, name: "도움말" });
    await helpButton.hover();
    await expect(page.getByText("도움말 보기", { exact: true })).toHaveCSS(
      "opacity",
      "1",
    );
    await helpButton.click();

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

    const errorDescription = helpDialog.getByLabel("에러 내용");
    const submitButton = helpDialog.getByRole("button", {
      exact: true,
      name: "보내기",
    });
    await expect(errorDescription).toBeVisible({ timeout: 10000 });
    await expectErrorDescriptionHeight(errorDescription);
    await expect(helpDialog.getByText("0/500")).toBeVisible();
    const screenshotPreviewButton = helpDialog.getByRole("button", {
      exact: true,
      name: "스크린샷 크게 보기",
    });
    const screenshotSwitch = helpDialog.getByRole("switch", {
      exact: true,
      name: "스크린샷 포함 여부",
    });
    await expect(screenshotPreviewButton).toBeVisible({ timeout: 10000 });
    await expect(screenshotSwitch).toHaveCSS(
      "background-color",
      "rgb(58, 131, 247)",
    );
    await screenshotPreviewButton.click();
    const screenshotPreviewDialog = page.getByRole("dialog", {
      exact: true,
      name: "스크린샷 미리보기",
    });
    await expect(screenshotPreviewDialog).toBeVisible();
    await screenshotPreviewDialog
      .getByRole("button", { exact: true, name: "닫기" })
      .click();
    await expect(screenshotPreviewDialog).toBeHidden();

    await screenshotSwitch.click();
    await expect(screenshotPreviewButton).toBeHidden();

    await expect(submitButton).toBeDisabled();
    await expectSubmitButtonRightAligned(submitButton);
    await errorDescription.fill(" ");
    await expect(helpDialog.getByText("1/500")).toBeVisible();
    await expect(submitButton).toBeDisabled();
    const maximumDescription = "가".repeat(500);
    await errorDescription.fill(`${maximumDescription}초과`);
    await expect(errorDescription).toHaveValue(maximumDescription);
    await expect(helpDialog.getByText("500/500")).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toHaveCSS(
      "background-color",
      "rgb(58, 131, 247)",
    );
    await errorDescription.fill("앗");
    await expect(helpDialog.getByText("1/500")).toBeVisible();
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

// 기능 : 에러 내용 입력창이 140px 기준 높이로 렌더링되는지 확인합니다.
async function expectErrorDescriptionHeight(textarea: Locator) {
  const height = await textarea.evaluate((node) =>
    Math.round(node.getBoundingClientRect().height),
  );

  expect(height).toBeGreaterThanOrEqual(140);
}

// 기능 : 에러 신고 제출 버튼이 도움말 모달 본문 우측 하단에 배치되는지 확인합니다.
async function expectSubmitButtonRightAligned(button: Locator) {
  const alignment = await button.evaluate((buttonNode) => {
    const dialogNode = buttonNode.closest('[role="dialog"]');

    if (dialogNode === null) {
      throw new Error("도움말 모달 dialog를 찾지 못했습니다.");
    }

    const dialogRect = dialogNode.getBoundingClientRect();
    const buttonRect = buttonNode.getBoundingClientRect();

    return {
      buttonRight: Math.round(buttonRect.right),
      dialogRight: Math.round(dialogRect.right),
    };
  });

  expect(alignment.dialogRight - alignment.buttonRight).toBeLessThanOrEqual(60);
}
