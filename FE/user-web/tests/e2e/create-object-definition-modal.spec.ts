import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("create object definition modal UX", () => {
  test("opens the object definition creation modal from the sidebar add button", async ({
    page,
  }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 3. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");
    // 4. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    // 5. 필요한 비동기 작업을 실행한다.
    await page
      .getByRole("button", { exact: true, name: "관리 항목 추가" })
      .click();

    // 6. 이후 단계에서 사용할 createObjectDialog 값을 준비한다.
    const createObjectDialog = page.getByRole("dialog").first();
    // 7. 필요한 비동기 작업을 실행한다.
    await expect(createObjectDialog).toBeVisible();
    await expect(createObjectDialog).toHaveCSS("max-width", "520px");
    // 8. 필요한 비동기 작업을 실행한다.
    await expect(
      createObjectDialog.getByRole("heading", {
        exact: true,
        name: "새 관리 항목 이름을 작성해 주세요.",
      }),
    ).toBeVisible();

    // 9. 이후 단계에서 사용할 nextButton 값을 준비한다.
    const nextButton = createObjectDialog.getByRole("button", {
      exact: true,
      name: "다음",
    });
    // 10. 필요한 비동기 작업을 실행한다.
    await expect(nextButton).toBeDisabled();
    // 11. 필요한 비동기 작업을 실행한다.
    await createObjectDialog.getByLabel("관리 항목 이름").fill("회사");
    // 12. 필요한 비동기 작업을 실행한다.
    await expect(nextButton).toBeEnabled();
    // 13. 필요한 비동기 작업을 실행한다.
    await nextButton.click();

    // 14. 필요한 비동기 작업을 실행한다.
    await createObjectDialog
      .getByRole("button", { exact: true, name: "이전" })
      .click();

    // 15. 테스트 기대 조건을 검증한다.
    await expect(createObjectDialog.getByLabel("관리 항목 이름")).toHaveValue(
      "회사",
    );

    // 16. 필요한 비동기 작업을 실행한다.
    await nextButton.click();

    // 17. 테스트 기대 조건을 검증한다.
    await expect(
      createObjectDialog.getByRole("heading", {
        exact: true,
        name: "회사 에 필요한 정보를 작성해 주세요.",
      }),
    ).toBeVisible();
    await expect(
      createObjectDialog.getByText("EX)회사명, 주소, 인원수", {
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(createObjectDialog.getByLabel("정보 1 이름")).toHaveAttribute(
      "placeholder",
      "Ex. 회사명",
    );
    await expect(createObjectDialog.getByLabel("정보 2 이름")).toHaveAttribute(
      "placeholder",
      "Ex. 주소",
    );
    await expect(createObjectDialog.getByLabel("정보 3 이름")).toHaveCount(0);

    // 18. 이후 단계에서 사용할 createButton 값을 준비한다.
    const createButton = createObjectDialog.getByRole("button", {
      exact: true,
      name: "생성하기",
    });
    // 19. 테스트 기대 조건을 검증한다.
    await expect(createButton).toBeDisabled();

    // 20. 필요한 비동기 작업을 실행한다.
    await createObjectDialog.getByLabel("정보 1 이름").fill("회사명");
    await createObjectDialog.getByLabel("정보 2 이름").fill("주소");

    // 21. 테스트 기대 조건을 검증한다.
    await expect(createButton).toBeEnabled();

    // 22. 필요한 비동기 작업을 실행한다.
    await createObjectDialog
      .getByRole("button", { exact: true, name: "정보 추가" })
      .click();

    // 23. 테스트 기대 조건을 검증한다.
    await expect(createObjectDialog.getByLabel("정보 3 이름")).toHaveAttribute(
      "placeholder",
      "필요한 정보",
    );
    await expect(createButton).toBeDisabled();

    // 24. 필요한 비동기 작업을 실행한다.
    await createObjectDialog.getByLabel("정보 3 이름").fill("인원수");

    // 25. 테스트 기대 조건을 검증한다.
    await expect(createButton).toBeEnabled();

    // 26. 필요한 비동기 작업을 실행한다.
    await createObjectDialog
      .getByRole("button", { exact: true, name: "정보 3 삭제" })
      .click();

    // 27. 테스트 기대 조건을 검증한다.
    await expect(createObjectDialog.getByLabel("정보 3 이름")).toHaveCount(0);
    await expect(createButton).toBeEnabled();

    // 28. 필요한 비동기 작업을 실행한다.
    await createObjectDialog
      .getByRole("button", { exact: true, name: "정보 2 삭제" })
      .click();

    // 29. 테스트 기대 조건을 검증한다.
    await expect(createObjectDialog.getByLabel("정보 2 이름")).toHaveCount(0);
    await expect(createButton).toBeEnabled();
    await expect(
      createObjectDialog.getByRole("button", {
        exact: true,
        name: "정보 1 삭제",
      }),
    ).toBeDisabled();

    // 30. 필요한 비동기 작업을 실행한다.
    await createButton.click();

    // 31. 테스트 기대 조건을 검증한다.
    await expect
      .poll(() => api.store.createdObjectDefinitionRequests?.length ?? 0)
      .toBe(1);
    expect(api.store.createdObjectDefinitionRequests).toEqual([
      {
        attributeNames: ["회사명"],
        objectDefinitionName: "회사",
        workspaceId: "workspace-e2e-001",
      },
    ]);

    // 32. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});
