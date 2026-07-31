import { expect, test, type Page } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.use({ hasTouch: true, isMobile: true, viewport: { height: 844, width: 390 } });

test.describe("G05 notification reminder UX QA", () => {
  test("reads a notification, updates unread count, and persists settings", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/notifications");

    await expect(
      page.getByRole("heading", { exact: true, name: "알림" }),
    ).toBeVisible();
    await expect(visibleText(page, "안읽음 1개")).toBeVisible();
    const notificationRow = page
      .locator("article:visible")
      .filter({ hasText: "딜 마감 reminder" });
    await notificationRow.getByRole("button", { name: "읽음" }).click();

    await expect(visibleText(page, "안읽음 0개")).toBeVisible();

    await expect(
      visibleText(page, "서비스 알림"),
    ).toBeVisible();
    await expect(
      visibleText(page, "마케팅 알림"),
    ).toBeVisible();
    await page
      .locator("label:visible")
      .filter({ hasText: "이메일 알림" })
      .getByRole("checkbox")
      .uncheck();
    await page.getByRole("button", { name: "저장" }).click();
    await expect(page.getByText("알림 설정을 저장했어요.")).toBeVisible();

    await page.reload();
    await expect(
      page
        .locator("label:visible")
        .filter({ hasText: "이메일 알림" })
        .getByRole("checkbox"),
    ).not.toBeChecked();

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("requests browser permission only after the explanation dialog confirmation", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await installGrantedPushPermissionMock(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/notifications");

    await expect(visibleText(page, "미설정")).toBeVisible();
    await expect(
      visibleText(page, "아직 이 브라우저에서 권한을 선택하지 않았어요."),
    ).toBeVisible();
    await expect(visibleButton(page, "푸시 알림 켜기")).toBeVisible();
    await expect(page.evaluate(readPermissionRequestCount)).resolves.toBe(0);

    await visibleButton(page, "푸시 알림 켜기").click();
    await expect(
      page.getByRole("dialog", {
        name: "중요한 영업 알림을 놓치지 않게 할까요?",
      }),
    ).toBeVisible();
    await expect(page.evaluate(readPermissionRequestCount)).resolves.toBe(0);

    await visibleButton(page, "계속").click();

    await expect(page.getByText("브라우저 푸시 구독을 등록했어요.")).toBeVisible();
    await expect(page.getByText("허용", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("등록됨", { exact: true }).first()).toBeVisible();
    await expect(page.evaluate(readPermissionRequestCount)).resolves.toBe(1);
    await expect(page.evaluate(readPushPermissionEvents)).resolves.toEqual([
      {
        eventName: "mobile_push_permission_prompt_opened",
        eventVersion: 1,
        payload: { entryPoint: "notifications" },
      },
      {
        eventName: "mobile_push_permission_result",
        eventVersion: 1,
        payload: {
          browserPushEnabled: true,
          permissionState: "granted",
        },
      },
    ]);
    expect(
      JSON.stringify(await page.evaluate(readPushPermissionEvents)),
    ).not.toContain("endpoint");
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("shows a safe browser push fallback when notification permission is denied", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await page.addInitScript(() => {
      if (!window.Notification) {
        return;
      }

      Object.defineProperty(window.Notification, "permission", {
        configurable: true,
        get: () => "denied",
      });
      Object.defineProperty(window.Notification, "requestPermission", {
        configurable: true,
        value: async () => "denied",
      });
    });
    await seedAuthenticatedSession(page);

    await page.goto("/app/notifications");

    await expect(visibleText(page, "차단")).toBeVisible();
    await expect(
      visibleTextContaining(page, "브라우저에서 알림이 차단되어 있어요."),
    ).toBeVisible();
    await expect(visibleButton(page, "푸시 알림 켜기")).toBeDisabled();

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("shows a safe browser push fallback when push APIs are unsupported", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, "PushManager", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: undefined,
      });
    });
    await seedAuthenticatedSession(page);

    await page.goto("/app/notifications");

    await expect(visibleText(page, "미지원")).toBeVisible();
    await expect(
      visibleText(page, "이 브라우저에서는 푸시 알림을 사용할 수 없어요."),
    ).toBeVisible();
    await expect(visibleButton(page, "푸시 알림 켜기")).toBeDisabled();

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

test.describe("G05 notification permission 360px QA", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { height: 740, width: 360 } });

  test("keeps the permission explanation dialog actions visible at 360px", async ({
    page,
  }) => {
    await setupUserWebApiMocks(page);
    await installGrantedPushPermissionMock(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/notifications");
    await visibleButton(page, "푸시 알림 켜기").click();

    const dialog = page.getByRole("dialog", {
      name: "중요한 영업 알림을 놓치지 않게 할까요?",
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("서비스 알림은 일정과 딜 업무 알림이에요.")).toBeVisible();
    await expect(visibleButton(page, "닫기")).toBeVisible();
    await expect(visibleButton(page, "계속")).toBeVisible();
  });
});

// 기능 : Playwright browser context에 permission granted 흐름과 push subscription mock을 설치합니다.
async function installGrantedPushPermissionMock(page: Page) {
  await page.addInitScript(() => {
    let permissionState: NotificationPermission = "default";
    let permissionRequestCount = 0;
    const clientEvents: unknown[] = [];
    const subscription = {
      async unsubscribe() {
        return true;
      },
      toJSON() {
        return {
          endpoint: "https://push.example.test/subscription/mobile-001",
          keys: {
            auth: "mock-auth-key",
            p256dh: "mock-p256dh-key",
          },
        };
      },
    };
    const pushManager = {
      async getSubscription() {
        return null;
      },
      async subscribe() {
        return subscription;
      },
    };
    const serviceWorkerRegistration = { pushManager };
    const notificationMock = {
      get permission() {
        return permissionState;
      },
      async requestPermission() {
        permissionRequestCount += 1;
        permissionState = "granted";
        return permissionState;
      },
    };

    window.addEventListener(
      "onehand:mobile-push-permission-analytics",
      (event) => {
        clientEvents.push((event as CustomEvent).detail);
      },
    );
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: notificationMock,
    });
    Object.defineProperty(window, "PushManager", {
      configurable: true,
      value: function PushManager() {},
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        async getRegistration() {
          return serviceWorkerRegistration;
        },
        async register() {
          return serviceWorkerRegistration;
        },
      },
    });
    Object.defineProperty(window, "__onehandPermissionRequestCount", {
      configurable: true,
      get: () => permissionRequestCount,
    });
    Object.defineProperty(window, "__onehandPushPermissionEvents", {
      configurable: true,
      get: () => clientEvents,
    });
  });
}

// 기능 : 반응형 shell에서 실제 보이는 button만 E2E action 대상으로 좁힙니다.
function visibleButton(page: Page, name: string) {
  return page.locator("button:visible").filter({ hasText: name });
}

// 기능 : 반응형 shell에서 실제 보이는 exact text만 E2E assertion 대상으로 좁힙니다.
function visibleText(page: Page, text: string) {
  return page.locator(`:visible:text-is("${text}")`);
}

// 기능 : 반응형 shell에서 실제 보이는 부분 text만 E2E assertion 대상으로 좁힙니다.
function visibleTextContaining(page: Page, text: string) {
  return page.locator(`:visible:text("${text}")`);
}

// 기능 : browser permission prompt 호출 횟수를 E2E assertion용으로 읽습니다.
function readPermissionRequestCount() {
  return Number(
    (window as unknown as { __onehandPermissionRequestCount?: number })
      .__onehandPermissionRequestCount ?? 0,
  );
}

// 기능 : G05 permission flow가 발행한 client event payload를 E2E assertion용으로 읽습니다.
function readPushPermissionEvents() {
  return [
    ...((window as unknown as { __onehandPushPermissionEvents?: unknown[] })
      .__onehandPushPermissionEvents ?? []),
  ];
}
