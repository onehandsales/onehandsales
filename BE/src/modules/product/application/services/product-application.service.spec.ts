import { ProductListSort } from "@/modules/product/application/ports/product-query.types";
import {
  type CreateProductInput,
  type CreateProductMemoLogInput,
  type CreateProductPrivateMemoLogInput,
  type DeleteProductInput,
  type DeleteProductMemoLogInput,
  type DeleteProductPrivateMemoLogInput,
  type ExportProductsInput,
  type ListProductDealsInput,
  type ListProductsInput,
  type ProductCategoryRecord,
  type ProductDealRecord,
  type ProductListRecord,
  type ProductLookupRecord,
  type ProductMemoLogRecord,
  type ProductPageRecord,
  type ProductPrivateMemoLogRecord,
  type ProductRecord,
  type ProductRepository,
  type ProductStatusRecord,
  type UpdateProductInput,
  type UpdateProductMemoLogInput,
} from "@/modules/product/application/ports/product.repository";
import type { ProductPrivateMemoEncryptionPort } from "@/modules/product/application/ports/product-private-memo-encryption.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type {
  XlsxWorkbookWriter,
  XlsxWorksheetInput,
} from "@/shared/application/ports/xlsx-workbook.writer";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { ProductApplicationService } from "./product-application.service";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
  defaultCurrencyCode: "USD",
};

type StoredProduct = ProductRecord & {
  readonly userId: string;
  readonly productCategoryId: string;
  readonly productStatusId: string;
  readonly dealCount: number;
};

// 역할 : FakeProductRepository 테스트용 제품 저장소를 메모리에서 구현합니다.
class FakeProductRepository implements ProductRepository {
  readonly categories: ProductCategoryRecord[] = [
    { id: "category-1", categoryName: "보안" },
  ];
  readonly statuses: ProductStatusRecord[] = [
    { id: "status-1", statusName: "판매중" },
  ];
  products: StoredProduct[] = [];
  createdMemoLogs: CreateProductMemoLogInput[] = [];
  transactionCount = 0;

  // 기능 : fake transaction을 현재 저장소에서 즉시 실행합니다.
  async runInTransaction<T>(
    work: (repository: ProductRepository) => Promise<T>
  ): Promise<T> {
    this.transactionCount += 1;
    return work(this);
  }

  // 기능 : fake 제품 목록과 전체 개수를 반환합니다.
  async listProducts(input: ListProductsInput): Promise<ProductPageRecord> {
    const items = this.products
      .filter((product) => product.userId === input.userId)
      .map((product) => this.toProductListRecord(product));

    return {
      items,
      totalCount: items.length,
    };
  }

  // 기능 : fake 제품 export 목록을 반환합니다.
  async listProductsForExport(
    input: ExportProductsInput
  ): Promise<ProductListRecord[]> {
    return this.products
      .filter((product) => product.userId === input.userId)
      .map((product) => this.toProductListRecord(product));
  }

  // 기능 : fake 제품에 연결된 딜 목록을 반환합니다.
  async listProductDeals(
    _input: ListProductDealsInput
  ): Promise<ProductDealRecord[]> {
    void _input;
    return [];
  }

  // 기능 : fake 제품 단건을 반환합니다.
  async findProduct(
    userId: string,
    productId: string
  ): Promise<ProductRecord | null> {
    return this.products.find(
      (product) => product.id === productId && product.userId === userId
    ) ?? null;
  }

  // 기능 : fake 제품 존재 여부를 반환합니다.
  async findProductLookup(
    userId: string,
    productId: string
  ): Promise<ProductLookupRecord | null> {
    const product = this.products.find(
      (item) => item.id === productId && item.userId === userId
    );

    return product ? { id: product.id, userId: product.userId } : null;
  }

  // 기능 : fake 제품을 생성합니다.
  async createProduct(input: CreateProductInput): Promise<ProductLookupRecord> {
    const createdAt = new Date("2026-06-12T10:00:00.000Z");
    const id = `product-${this.products.length + 1}`;
    const productCategory = this.categories.find(
      (category) => category.id === input.productCategoryId
    );
    const productStatus = this.statuses.find(
      (status) => status.id === input.productStatusId
    );

    if (!productCategory || !productStatus) {
      throw new Error("Missing fake product taxonomy");
    }

    this.products.push({
      id,
      userId: input.userId,
      productName: input.productName,
      productPrice: input.productPrice,
      currencyCode: input.currencyCode,
      productCategory,
      productStatus,
      productCategoryId: input.productCategoryId,
      productStatusId: input.productStatusId,
      dealCount: 0,
      createdAt,
      updatedAt: createdAt,
    });

    return { id, userId: input.userId };
  }

  // 기능 : fake 제품 기본 정보를 수정합니다.
  async updateProduct(
    userId: string,
    productId: string,
    input: UpdateProductInput
  ): Promise<boolean> {
    const product = this.products.find(
      (item) => item.id === productId && item.userId === userId
    );

    if (!product) {
      return false;
    }

    this.products = this.products.map((item) =>
      item.id === productId
        ? {
            ...item,
            ...(input.productName !== undefined
              ? { productName: input.productName }
              : {}),
            ...(input.productPrice !== undefined
              ? { productPrice: input.productPrice }
              : {}),
            ...(input.currencyCode !== undefined
              ? { currencyCode: input.currencyCode }
              : {}),
            updatedAt: new Date("2026-06-12T10:30:00.000Z"),
          }
        : item
    );
    return true;
  }

  // 기능 : fake 제품 삭제를 처리합니다.
  async deleteProduct(_input: DeleteProductInput): Promise<boolean> {
    void _input;
    return true;
  }

  async listCategories(): Promise<ProductCategoryRecord[]> {
    return this.categories;
  }

  async findCategory(
    _userId: string,
    categoryId: string
  ): Promise<ProductCategoryRecord | null> {
    void _userId;
    return this.categories.find((category) => category.id === categoryId) ?? null;
  }

  async existsCategoryByName(): Promise<boolean> {
    return false;
  }

  async createCategory(): Promise<void> {
    return undefined;
  }

  async isCategoryInUse(): Promise<boolean> {
    return false;
  }

  async deleteCategory(): Promise<void> {
    return undefined;
  }

  async listStatuses(): Promise<ProductStatusRecord[]> {
    return this.statuses;
  }

  async findStatus(
    _userId: string,
    statusId: string
  ): Promise<ProductStatusRecord | null> {
    void _userId;
    return this.statuses.find((status) => status.id === statusId) ?? null;
  }

  async existsStatusByName(): Promise<boolean> {
    return false;
  }

  async createStatus(): Promise<void> {
    return undefined;
  }

  async isStatusInUse(): Promise<boolean> {
    return false;
  }

  async deleteStatus(): Promise<void> {
    return undefined;
  }

  async createMemoLog(input: CreateProductMemoLogInput): Promise<void> {
    this.createdMemoLogs.push(input);
  }

  async listMemoLogs(): Promise<ProductMemoLogRecord[]> {
    return [];
  }

  async updateMemoLog(_input: UpdateProductMemoLogInput): Promise<boolean> {
    void _input;
    return false;
  }

  async deleteMemoLog(_input: DeleteProductMemoLogInput): Promise<boolean> {
    void _input;
    return false;
  }

  async createPrivateMemoLog(
    _input: CreateProductPrivateMemoLogInput
  ): Promise<void> {
    void _input;
  }

  async listPrivateMemoLogs(): Promise<ProductPrivateMemoLogRecord[]> {
    return [];
  }

  async updatePrivateMemo(): Promise<boolean> {
    return false;
  }

  async updatePrivateMemoLog(): Promise<boolean> {
    return false;
  }

  async deletePrivateMemoLog(
    _input: DeleteProductPrivateMemoLogInput
  ): Promise<boolean> {
    void _input;
    return false;
  }

  // 기능 : fake 저장 제품을 목록 레코드로 변환합니다.
  private toProductListRecord(product: StoredProduct): ProductListRecord {
    return {
      id: product.id,
      productName: product.productName,
      productPrice: product.productPrice,
      currencyCode: product.currencyCode,
      productCategory: product.productCategory,
      productStatus: product.productStatus,
      dealCount: product.dealCount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

// 역할 : FakeProductPrivateMemoEncryption 테스트용 개인 메모 암호화 포트입니다.
class FakeProductPrivateMemoEncryption implements ProductPrivateMemoEncryptionPort {
  // 기능 : 테스트 평문을 고정 암호문 형태로 변환합니다.
  encrypt(plaintext: string) {
    return { ciphertext: `encrypted:${plaintext}`, keyVersion: "test-key" };
  }

  // 기능 : 테스트 암호문에서 평문 접두어를 제거합니다.
  decrypt(ciphertext: string, _keyVersion: string): string {
    void _keyVersion;
    return ciphertext.replace(/^encrypted:/, "");
  }
}

// 역할 : FakeXlsxWorkbookWriter 테스트용 xlsx writer를 구현합니다.
class FakeXlsxWorkbookWriter implements XlsxWorkbookWriter {
  lastInput: XlsxWorksheetInput | null = null;

  // 기능 : 마지막 worksheet 입력을 저장하고 fake Buffer를 반환합니다.
  async writeWorksheet(input: XlsxWorksheetInput): Promise<Buffer> {
    this.lastInput = input;
    return Buffer.from("fake-xlsx");
  }
}

// 역할 : FakeAppLogger 테스트 로그 출력을 막는 logger입니다.
class FakeAppLogger extends AppLogger {
  // 기능 : 테스트에서 로그 출력을 생략합니다.
  override log(_message: string, _context?: string): void {
    void _message;
    void _context;
  }
}

// 기능 : ProductApplicationService 테스트 인스턴스를 생성합니다.
function createService(
  repository: FakeProductRepository,
  writer: XlsxWorkbookWriter = new FakeXlsxWorkbookWriter()
) {
  return new ProductApplicationService(
    repository,
    new FakeProductPrivateMemoEncryption(),
    writer,
    new FakeAppLogger()
  );
}

// 기능 : 기본 제품 생성 command를 반환합니다.
function createProductCommand() {
  return {
    productName: " 프리미엄 상품 ",
    productPrice: 1200000,
    productCategoryId: "category-1",
    productStatusId: "status-1",
  };
}

// 기능 : ProductApplicationService 통화 계약을 검증합니다.
describe("ProductApplicationService", () => {
  it("uses current user default currency when product currency is omitted", async () => {
    const repository = new FakeProductRepository();
    const service = createService(repository);

    await service.createProduct(CURRENT_USER, createProductCommand());

    expect(repository.transactionCount).toBe(1);
    expect(repository.products[0]?.productName).toBe("프리미엄 상품");
    expect(repository.products[0]?.currencyCode).toBe("USD");
  });

  it("normalizes explicit product currency before saving", async () => {
    const repository = new FakeProductRepository();
    const service = createService(repository);

    await service.createProduct(CURRENT_USER, {
      ...createProductCommand(),
      currencyCode: "krw",
    });

    expect(repository.products[0]?.currencyCode).toBe("KRW");
  });

  it("rejects unsupported product currency code", async () => {
    const repository = new FakeProductRepository();
    const service = createService(repository);

    await expect(
      service.createProduct(CURRENT_USER, {
        ...createProductCommand(),
        currencyCode: "EUR",
      })
    ).rejects.toMatchObject({
      code: "CURRENCY_UNSUPPORTED",
      details: { field: "currencyCode" },
    });
  });

  it("localizes product export headers, row currency, and timezone dates", async () => {
    const repository = new FakeProductRepository();
    const writer = new FakeXlsxWorkbookWriter();
    const service = createService(repository, writer);
    const exportUser: CurrentUserContext = {
      ...CURRENT_USER,
      preferredLocale: "en",
      timeZone: "America/New_York",
    };

    await service.createProduct(CURRENT_USER, createProductCommand());
    await service.exportProductsXlsx(exportUser, {
      sort: ProductListSort.CREATED_AT_DESC,
    });

    // 기능 : 사용자 locale 기준의 sheet/header가 제품 export에 반영되는지 검증합니다.
    expect(writer.lastInput?.sheetName).toBe("Products");
    expect(writer.lastInput?.columns.map((column) => column.header)).toEqual([
      "Product Name",
      "Price",
      "Currency",
      "Category",
      "Status",
      "Deals",
      "Created At",
    ]);
    expect(writer.lastInput?.columns.map((column) => column.key)).toEqual([
      "productName",
      "productPrice",
      "currencyCode",
      "categoryName",
      "statusName",
      "dealCount",
      "createdAt",
    ]);
    expect(writer.lastInput?.rows[0]).toEqual(
      expect.objectContaining({
        productName: "프리미엄 상품",
        productPrice: "$1,200,000",
        currencyCode: "USD",
        createdAt: "06/12/2026 06:00:00",
      })
    );
  });
});
