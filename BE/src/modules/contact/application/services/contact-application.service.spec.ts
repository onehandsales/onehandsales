import type {
  ContactPageRecord,
  ContactRecord,
  ContactRepository,
  ListContactsInput,
} from "@/modules/contact/application/ports/contact.repository";
import type { ContactPrivateMemoEncryptionPort } from "@/modules/contact/application/ports/contact-private-memo-encryption.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { XlsxWorkbookWriter } from "@/shared/application/ports/xlsx-workbook.writer";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { ContactApplicationService } from "./contact-application.service";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

// 역할 : FakeContactRepository 담당자 service 테스트용 저장소를 메모리에서 구현합니다.
class FakeContactRepository implements Partial<ContactRepository> {
  readonly listContactsInputs: ListContactsInput[] = [];

  // 기능 : fake 담당자 목록 조회 입력을 기록하고 dealCount 포함 결과를 반환합니다.
  async listContacts(input: ListContactsInput): Promise<ContactPageRecord> {
    this.listContactsInputs.push(input);

    return {
      items: [createContactRecord({ dealCount: 2 })],
      totalCount: 1,
    };
  }
}

// 역할 : FakeAppLogger 테스트 로그 출력을 막는 logger입니다.
class FakeAppLogger extends AppLogger {
  // 기능 : 테스트에서 로그 출력을 의도적으로 무시합니다.
  override log(_message: string): void {
    void _message;
  }
}

const privateMemoEncryption: ContactPrivateMemoEncryptionPort = {
  encrypt(plaintext: string) {
    return {
      ciphertext: plaintext,
      keyVersion: "test",
    };
  },
  decrypt(ciphertext: string) {
    return ciphertext;
  },
};

const xlsxWriter = {
  writeWorksheet: jest.fn(),
} as unknown as XlsxWorkbookWriter;

describe("ContactApplicationService", () => {
  it("lists contacts with dealCount and page size 15", async () => {
    const repository = new FakeContactRepository();
    const service = new ContactApplicationService(
      repository as unknown as ContactRepository,
      privateMemoEncryption,
      xlsxWriter,
      new FakeAppLogger()
    );

    const result = await service.listContacts(CURRENT_USER, {});

    expect(repository.listContactsInputs[0]).toMatchObject({
      userId: CURRENT_USER.id,
      page: 1,
      pageSize: 15,
    });
    expect(result).toMatchObject({
      page: 1,
      pageSize: 15,
      totalCount: 1,
      totalPages: 1,
    });
    expect(result.items[0]?.dealCount).toBe(2);
  });
});

function createContactRecord(
  overrides: Partial<ContactRecord> = {}
): ContactRecord {
  return {
    id: "contact-1",
    company: {
      id: "company-1",
      companyName: "A회사",
    },
    username: "김민수",
    mobile: "010-1111-2222",
    email: "minsu@example.com",
    contactDepartment: {
      id: "department-1",
      departmentName: "영업",
    },
    contactJobGrade: {
      id: "job-grade-1",
      jobGradeName: "팀장",
    },
    dealCount: 0,
    createdAt: new Date("2026-07-26T01:00:00.000Z"),
    updatedAt: new Date("2026-07-26T02:00:00.000Z"),
    ...overrides,
  };
}
