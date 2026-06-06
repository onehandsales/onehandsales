import type {
  ContactDetailRecord,
  ContactLogRecord,
  ContactRecord,
  ContactRepository,
  CreateContactInput,
  DeleteResultRecord,
  ListContactsInput,
  PaginatedResult,
} from "@/modules/contact/application/ports/contact.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  DeletedResourceError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";
import { CreateContactUseCase } from "./create-contact.use-case";
import { DeleteContactUseCase } from "./delete-contact.use-case";
import { GetContactUseCase } from "./get-contact.use-case";
import { ListContactsUseCase } from "./list-contacts.use-case";

class FakeContactRepository implements ContactRepository {
  createInput: CreateContactInput | null = null;
  listInput: ListContactsInput | null = null;
  deleteInput: {
    readonly userId: string;
    readonly contactId: string;
  } | null = null;
  detail: ContactDetailRecord | null = null;

  async listContacts(
    input: ListContactsInput
  ): Promise<PaginatedResult<ContactRecord>> {
    this.listInput = input;

    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 0,
      hasNext: false,
    };
  }

  async createContact(input: CreateContactInput): Promise<ContactRecord> {
    this.createInput = input;

    return createContactRecord({
      id: "contact-1",
      userId: input.userId,
      name: input.name,
      deletedAt: null,
    });
  }

  async getContactDetail(): Promise<ContactDetailRecord | null> {
    return this.detail;
  }

  async updateContact(): Promise<ContactRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async deleteContact(
    userId: string,
    contactId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    this.deleteInput = { userId, contactId };

    return {
      id: contactId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async restoreContact(): Promise<ContactRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async listContactLogs(): Promise<PaginatedResult<ContactLogRecord>> {
    throw new Error("Not implemented in fake repository");
  }

  async createContactLog(): Promise<ContactLogRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async updateContactLog(): Promise<ContactLogRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async deleteContactLog(): Promise<DeleteResultRecord> {
    throw new Error("Not implemented in fake repository");
  }
}

describe("Contact use cases", () => {
  it("normalizes create input and passes current user ownership", async () => {
    const repository = new FakeContactRepository();
    const useCase = new CreateContactUseCase(repository);

    await useCase.execute(currentUser(), {
      name: "  김담당  ",
      companyId: "  company-1  ",
      department: "  영업  ",
      position: "  팀장  ",
      phone: "  010-1234-5678  ",
      email: "  contact@example.com  ",
      address: "  서울  ",
      initialMemo: "  첫 미팅에서 의사결정 구조 확인  ",
    });

    expect(repository.createInput).toMatchObject({
      userId: "user-1",
      name: "김담당",
      companyId: "company-1",
      department: "영업",
      position: "팀장",
      phone: "010-1234-5678",
      email: "contact@example.com",
      address: "서울",
      initialMemo: "첫 미팅에서 의사결정 구조 확인",
    });
  });

  it("allows contact creation without a company", async () => {
    const repository = new FakeContactRepository();
    const useCase = new CreateContactUseCase(repository);

    await useCase.execute(currentUser(), {
      name: "김담당",
      companyId: "   ",
    });

    expect(repository.createInput?.companyId).toBeNull();
  });

  it("rejects whitespace-only required contact names", async () => {
    const repository = new FakeContactRepository();
    const useCase = new CreateContactUseCase(repository);

    await expect(
      useCase.execute(currentUser(), {
        name: "   ",
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
  });

  it("normalizes list pagination, search, and company filter", async () => {
    const repository = new FakeContactRepository();
    const useCase = new ListContactsUseCase(repository);

    await useCase.execute(currentUser(), {
      page: -1,
      pageSize: 500,
      search: "  김담당  ",
      companyId: "  company-1  ",
      includeDeleted: true,
    });

    expect(repository.listInput).toEqual({
      userId: "user-1",
      page: 1,
      pageSize: 100,
      search: "김담당",
      companyId: "company-1",
      includeDeleted: true,
    });
  });

  it("returns DeletedResource for deleted contact detail reads", async () => {
    const repository = new FakeContactRepository();
    repository.detail = {
      contact: createContactRecord({
        id: "contact-1",
        userId: "user-1",
        name: "삭제된 거래처",
        deletedAt: new Date("2026-06-06T00:00:00.000Z"),
      }),
      company: null,
      memos: [],
      relatedDealCount: 0,
      relatedProductCount: 0,
    };
    const useCase = new GetContactUseCase(repository);

    await expect(
      useCase.execute(currentUser(), "contact-1")
    ).rejects.toBeInstanceOf(DeletedResourceError);
  });

  it("passes current user ownership to delete", async () => {
    const repository = new FakeContactRepository();
    const useCase = new DeleteContactUseCase(repository);

    const response = await useCase.execute(currentUser(), "contact-1");

    expect(repository.deleteInput).toEqual({
      userId: "user-1",
      contactId: "contact-1",
    });
    expect(response.id).toBe("contact-1");
  });
});

function currentUser(): CurrentUserContext {
  return {
    id: "user-1",
    sessionId: "session-1",
    email: "user@example.com",
    displayName: "User",
    role: "USER",
    status: "ACTIVE",
  };
}

function createContactRecord(input: {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly deletedAt: Date | null;
}): ContactRecord {
  const now = new Date("2026-06-06T00:00:00.000Z");

  return {
    id: input.id,
    userId: input.userId,
    companyId: null,
    companyName: null,
    name: input.name,
    department: null,
    position: null,
    phone: null,
    email: null,
    address: null,
    memoSummary: {
      hasMemo: false,
      memoCount: 0,
      latestMemoAt: null,
    },
    createdAt: now,
    updatedAt: now,
    deletedAt: input.deletedAt,
    permanentDeleteAt: null,
  };
}
