import { expect, test, type Locator } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("help modal UX", () => {
  test("opens five help sections in a centered compact modal", async ({
    page,
  }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 3. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");
    // 4. 이후 처리에 사용할 helpButton을 계산한다.
    const helpButton = page.getByRole("button", { exact: true, name: "도움말" });
    // 5. 필요한 비동기 작업을 실행한다.
    await helpButton.hover();
    // 6. 필요한 비동기 작업을 실행한다.
    await expect(page.getByText("도움말 보기", { exact: true })).toHaveCSS(
      "opacity",
      "1",
    );
    // 7. 필요한 비동기 작업을 실행한다.
    await helpButton.click();

    // 8. 필요한 비동기 작업을 실행한다.
    await expect(
      page.getByRole("menuitem", { exact: true, name: "사용 가이드" }),
    ).toBeVisible();
    // 9. 필요한 비동기 작업을 실행한다.
    await expect(
      page.getByRole("menuitem", { exact: true, name: "지원요청" }),
    ).toBeVisible();
    // 10. 필요한 비동기 작업을 실행한다.
    await expect(
      page.getByRole("menuitem", { exact: true, name: "에러신고" }),
    ).toBeVisible();
    // 11. 필요한 비동기 작업을 실행한다.
    await expect(
      page.getByRole("menuitem", { exact: true, name: "이용약관" }),
    ).toBeVisible();
    // 12. 필요한 비동기 작업을 실행한다.
    await expect(
      page.getByRole("menuitem", { exact: true, name: "개인정보" }),
    ).toBeVisible();

    // 13. 필요한 비동기 작업을 실행한다.
    await page.getByRole("menuitem", { exact: true, name: "사용 가이드" }).click();

    // 14. 이후 처리에 사용할 helpDialog을 계산한다.
    const helpDialog = page.getByRole("dialog", { name: "도움말" });
    // 15. 필요한 비동기 작업을 실행한다.
    await expect(helpDialog).toBeVisible();
    // 16. 필요한 비동기 작업을 실행한다.
    await expect(
      helpDialog.getByRole("heading", { exact: true, name: "사용 가이드" }),
    ).toBeVisible();
    // 17. 필요한 비동기 작업을 실행한다.
    await expectHelpDialogWidth(helpDialog);
    // 18. 필요한 비동기 작업을 실행한다.
    await expectHelpSidebarIconSize(
      helpDialog.getByRole("button", { exact: true, name: "사용 가이드" }),
    );
    // 19. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app$/);
    // 20. 필요한 비동기 작업을 실행한다.
    await expect(
      page.getByRole("heading", { exact: true, name: "설정" }),
    ).toHaveCount(0);

    // 21. 필요한 비동기 작업을 실행한다.
    await helpDialog.getByRole("button", { exact: true, name: "개인정보" }).click();
    // 22. 필요한 비동기 작업을 실행한다.
    await expect(
      helpDialog.getByRole("heading", {
        exact: true,
        name: "개인정보 처리방침",
      }),
    ).toBeVisible();

    // 23. 필요한 비동기 작업을 실행한다.
    await helpDialog.getByRole("button", { exact: true, name: "지원요청" }).click();
    // 24. 필요한 비동기 작업을 실행한다.
    await expect(
      helpDialog.getByRole("heading", { exact: true, name: "지원요청" }),
    ).toBeVisible();
    // 25. 필요한 비동기 작업을 실행한다.
    await expect(helpDialog.getByRole("combobox").first()).toBeVisible();
    // 26. 필요한 비동기 작업을 실행한다.
    await expect(helpDialog.getByRole("textbox").first()).toBeVisible();
    // 27. 필요한 비동기 작업을 실행한다.
    await expect(helpDialog.locator("button:disabled").last()).toBeVisible();

    // 28. 필요한 비동기 작업을 실행한다.
    await helpDialog.getByRole("button", { exact: true, name: "에러신고" }).click();
    // 29. 필요한 비동기 작업을 실행한다.
    await expect(
      helpDialog.getByRole("heading", { exact: true, name: "에러신고" }),
    ).toBeVisible();

    // 30. 이후 처리에 사용할 errorDescription을 계산한다.
    const errorDescription = helpDialog.getByLabel("에러 내용");
    // 31. 이후 처리에 사용할 submitButton을 계산한다.
    const submitButton = helpDialog.getByRole("button", {
      exact: true,
      name: "보내기",
    });
    // 32. 필요한 비동기 작업을 실행한다.
    await expect(errorDescription).toBeVisible({ timeout: 10000 });
    // 33. 필요한 비동기 작업을 실행한다.
    await expectErrorDescriptionHeight(errorDescription);
    // 34. 필요한 비동기 작업을 실행한다.
    await expect(helpDialog.getByText("0/500")).toBeVisible();
    // 35. 이후 처리에 사용할 screenshotPreviewButton을 계산한다.
    const screenshotPreviewButton = helpDialog.getByRole("button", {
      exact: true,
      name: "스크린샷 크게 보기",
    });
    // 36. 이후 처리에 사용할 screenshotSwitch을 계산한다.
    const screenshotSwitch = helpDialog.getByRole("switch", {
      exact: true,
      name: "스크린샷 포함 여부",
    });
    // 37. 필요한 비동기 작업을 실행한다.
    await expect(screenshotPreviewButton).toBeVisible({ timeout: 10000 });
    // 38. 필요한 비동기 작업을 실행한다.
    await expect(screenshotSwitch).toHaveCSS(
      "background-color",
      "rgb(58, 131, 247)",
    );
    // 39. 필요한 비동기 작업을 실행한다.
    await screenshotPreviewButton.click();
    // 40. 이후 처리에 사용할 screenshotPreviewDialog을 계산한다.
    const screenshotPreviewDialog = page.getByRole("dialog", {
      exact: true,
      name: "스크린샷 미리보기",
    });
    // 41. 필요한 비동기 작업을 실행한다.
    await expect(screenshotPreviewDialog).toBeVisible();
    // 42. 필요한 비동기 작업을 실행한다.
    await screenshotPreviewDialog
      .getByRole("button", { exact: true, name: "닫기" })
      .click();
    // 43. 필요한 비동기 작업을 실행한다.
    await expect(screenshotPreviewDialog).toBeHidden();

    // 44. 필요한 비동기 작업을 실행한다.
    await screenshotSwitch.click();
    // 45. 필요한 비동기 작업을 실행한다.
    await expect(screenshotPreviewButton).toBeHidden();

    // 46. 필요한 비동기 작업을 실행한다.
    await expect(submitButton).toBeDisabled();
    // 47. 필요한 비동기 작업을 실행한다.
    await expectSubmitButtonRightAligned(submitButton);
    // 48. 필요한 비동기 작업을 실행한다.
    await errorDescription.fill(" ");
    // 49. 필요한 비동기 작업을 실행한다.
    await expect(helpDialog.getByText("1/500")).toBeVisible();
    // 50. 필요한 비동기 작업을 실행한다.
    await expect(submitButton).toBeDisabled();
    // 51. 이후 처리에 사용할 maximumDescription을 계산한다.
    const maximumDescription = "가".repeat(500);
    // 52. 필요한 비동기 작업을 실행한다.
    await errorDescription.fill(`${maximumDescription}초과`);
    // 53. 필요한 비동기 작업을 실행한다.
    await expect(errorDescription).toHaveValue(maximumDescription);
    // 54. 필요한 비동기 작업을 실행한다.
    await expect(helpDialog.getByText("500/500")).toBeVisible();
    // 55. 필요한 비동기 작업을 실행한다.
    await expect(submitButton).toBeEnabled();
    // 56. 필요한 비동기 작업을 실행한다.
    await expect(submitButton).toHaveCSS(
      "background-color",
      "rgb(58, 131, 247)",
    );
    // 57. 필요한 비동기 작업을 실행한다.
    await errorDescription.fill("앗");
    // 58. 필요한 비동기 작업을 실행한다.
    await expect(helpDialog.getByText("1/500")).toBeVisible();
    // 59. 필요한 비동기 작업을 실행한다.
    await expect(submitButton).toBeEnabled();
    // 60. 필요한 비동기 작업을 실행한다.
    await submitButton.click();
    // 61. 필요한 비동기 작업을 실행한다.
    await expect(
      helpDialog.getByText("신고가 접수되었어요. 문제를 빠르게 해결할게요."),
    ).toBeVisible();
    // 62. 필요한 비동기 작업을 실행한다.
    await expect(helpDialog).toBeHidden({ timeout: 3000 });

    // 63. 테스트 기대 조건을 검증한다.
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
    // 1. 이후 처리에 사용할 dialogNode을 계산한다.
    const dialogNode = buttonNode.closest('[role="dialog"]');

    // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (dialogNode === null) {
      throw new Error("도움말 모달 dialog를 찾지 못했습니다.");
    }

    // 3. 이후 처리에 사용할 dialogRect을 계산한다.
    const dialogRect = dialogNode.getBoundingClientRect();
    // 4. 이후 처리에 사용할 buttonRect을 계산한다.
    const buttonRect = buttonNode.getBoundingClientRect();

    // 5. 계산된 결과를 호출자에게 반환한다.
    return {
      buttonRight: Math.round(buttonRect.right),
      dialogRight: Math.round(dialogRect.right),
    };
  });

  expect(alignment.dialogRight - alignment.buttonRight).toBeLessThanOrEqual(60);
}
