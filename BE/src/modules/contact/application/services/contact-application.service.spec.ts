import type {
  ContactPageRecord,
  ContactRecord,
  ContactRepository,
  ExportContactsInput,
  ListContactsInput,
} from "@/modules/contact/application/ports/contact.repository";
import type { ContactPrivateMemoEncryptionPort } from "@/modules/contact/application/ports/contact-private-memo-encryption.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type {
  XlsxWorkbookWriter,
  XlsxWorksheetInput,
} from "@/shared/application/ports/xlsx-workbook.writer";
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
  readonly listContactsForExportInputs: ExportContactsInput[] = [];

  // 기능 : fake 담당자 목록 조회 입력을 기록하고 dealCount 포함 결과를 반환합니다.
  async listContacts(input: ListContactsInput): Promise<ContactPageRecord> {
    this.listContactsInputs.push(input);

    return {
      items: [createContactRecord({ dealCount: 2 })],
      totalCount: 1,
    };
  }

  // 기능 : fake 담당자 export 입력을 기록하고 담당자 행을 반환합니다.
  async listContactsForExport(
    input: ExportContactsInput
  ): Promise<ContactRecord[]> {
    this.listContactsForExportInputs.push(input);
    return [createContactRecord()];
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

function createXlsxWriter() {
  return {
    writeWorksheet: jest.fn().mockResolvedValue(Buffer.from("xlsx")),
  } as unknown as jest.Mocked<XlsxWorkbookWriter>;
}

describe("ContactApplicationService", () => {
  it("lists contacts with dealCount and page size 15", async () => {
    const repository = new FakeContactRepository();
    const writer = createXlsxWriter();
    const service = new ContactApplicationService(
      repository as unknown as ContactRepository,
      privateMemoEncryption,
      writer,
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

  it("exports localized phone columns and user timezone dates", async () => {
    const repository = new FakeContactRepository();
    const writer = createXlsxWriter();
    const service = new ContactApplicationService(
      repository as unknown as ContactRepository,
      privateMemoEncryption,
      writer,
      new FakeAppLogger()
    );
    const exportUser: CurrentUserContext = {
      ...CURRENT_USER,
      preferredLocale: "en",
      timeZone: "America/New_York",
    };

    await service.exportContactsXlsx(exportUser, {});

    const worksheetInput = writer.writeWorksheet.mock.calls[0]?.[0] as
      | XlsxWorksheetInput
      | undefined;

    // 기능 : 담당자 export가 전화번호 세분 컬럼과 locale header를 유지하는지 검증합니다.
    expect(worksheetInput?.sheetName).toBe("Contacts");
    expect(worksheetInput?.columns.map((column) => column.header)).toEqual([
      "Company Name",
      "Contact Name",
      "Phone",
      "Phone Country",
      "Phone E.164",
      "Email",
      "Department",
      "Title",
      "Created At",
    ]);
    expect(worksheetInput?.rows[0]).toEqual(
      expect.objectContaining({
        phone: "010-1111-2222",
        phoneCountry: "KR",
        phoneE164: "+821011112222",
        createdAt: "07/25/2026 21:00:00",
      })
    );
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
    phoneCountryCode: "KR",
    phoneNationalNumber: "01011112222",
    phoneE164: "+821011112222",
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
