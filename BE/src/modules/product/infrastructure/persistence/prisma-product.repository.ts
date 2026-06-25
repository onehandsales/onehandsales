import { Prisma } from "@prisma/client";
import {
  type CreateProductInput,
  type CreateProductMemoLogInput,
  type CreateProductPrivateMemoLogInput,
  type DeleteProductMemoLogInput,
  type DeleteProductInput,
  type DeleteProductPrivateMemoLogInput,
  type ExportProductsInput,
  type ListProductDealsInput,
  type ListProductsInput,
  type MemoLogCursor,
  type ProductCategoryRecord,
  type ProductDealRecord,
  type ProductListRecord,
  ProductListSort,
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
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type ProductPrismaClient = PrismaService | Prisma.TransactionClient;

type ProductWithRelations = {
  readonly id: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly productCategory: {
    readonly id: string;
    readonly categoryName: string;
  };
  readonly productStatus: {
    readonly id: string;
    readonly statusName: string;
  };
};

type ProductListWithRelations = ProductWithRelations & {
  readonly _count: {
    readonly dealProducts: number;
  };
};

// 역할 : PrismaProductRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaProductRepository implements ProductRepository {
  // 기능 : Prisma 클라이언트와 선택적 트랜잭션 실행기를 주입받습니다.
  constructor(
    private readonly client: ProductPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 제품 저장소 작업을 트랜잭션 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: ProductRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    // 기능 : Prisma 트랜잭션 클라이언트로 격리된 제품 저장소 콜백을 실행합니다.
    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaProductRepository(transaction, null));
    });
  }

  // 기능 : 현재 사용자의 제품 목록과 전체 개수를 조회합니다.
  async listProducts(input: ListProductsInput): Promise<ProductPageRecord> {
    const where = this.createProductWhere(input);

    const [items, totalCount] = await Promise.all([
      this.client.product.findMany({
        where,
        include: this.createProductListInclude(input.userId),
        orderBy: this.createProductOrderBy(input.sort),
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.client.product.count({ where }),
    ]);

    return {
      items: items.map((product) => this.mapProductList(product)),
      totalCount,
    };
  }

  // 기능 : 현재 사용자의 제품 export 대상 전체 목록을 조회합니다.
  async listProductsForExport(
    input: ExportProductsInput
  ): Promise<ProductListRecord[]> {
    const items = await this.client.product.findMany({
      where: this.createProductWhere(input),
      include: this.createProductListInclude(input.userId),
      orderBy: this.createProductOrderBy(input.sort),
    });

    return items.map((product) => this.mapProductList(product));
  }

  // 기능 : 현재 사용자의 제품에 연결된 딜 전체 목록을 조회합니다.
  async listProductDeals(
    input: ListProductDealsInput
  ): Promise<ProductDealRecord[]> {
    return this.client.deal.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        dealProducts: {
          some: {
            userId: input.userId,
            productId: input.productId,
          },
        },
      },
      select: {
        id: true,
        dealName: true,
        dealCost: true,
        dealStatus: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  // 기능 : 현재 사용자의 제품 단건을 relation과 함께 조회합니다.
  async findProduct(
    userId: string,
    productId: string
  ): Promise<ProductRecord | null> {
    const product = await this.client.product.findFirst({
      where: {
        id: productId,
        userId,
        deletedAt: null,
      },
      include: {
        productCategory: true,
        productStatus: true,
      },
    });

    return product ? this.mapProduct(product) : null;
  }

  // 기능 : 현재 사용자의 제품 존재 여부만 조회합니다.
  async findProductLookup(
    userId: string,
    productId: string
  ): Promise<ProductLookupRecord | null> {
    const product = await this.client.product.findFirst({
      where: {
        id: productId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    return product;
  }

  // 기능 : 현재 사용자의 제품 단건을 생성합니다.
  async createProduct(input: CreateProductInput): Promise<ProductLookupRecord> {
    const product = await this.client.product.create({
      data: {
        userId: input.userId,
        productName: input.productName,
        productPrice: input.productPrice,
        productCategoryId: input.productCategoryId,
        productStatusId: input.productStatusId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    return product;
  }

  // 기능 : 현재 사용자의 제품 기본 정보를 수정합니다.
  async updateProduct(
    userId: string,
    productId: string,
    input: UpdateProductInput
  ): Promise<boolean> {
    const result = await this.client.product.updateMany({
      where: {
        id: productId,
        userId,
        deletedAt: null,
      },
      data: {
        ...(input.productName !== undefined
          ? { productName: input.productName }
          : {}),
        ...(input.productPrice !== undefined
          ? { productPrice: input.productPrice }
          : {}),
        ...(input.productCategoryId !== undefined
          ? { productCategoryId: input.productCategoryId }
          : {}),
        ...(input.productStatusId !== undefined
          ? { productStatusId: input.productStatusId }
          : {}),
      },
    });

    return result.count > 0;
  }

  // 기능 : 현재 사용자의 제품 카테고리 목록을 정렬해 조회합니다.
  async listCategories(userId: string): Promise<ProductCategoryRecord[]> {
    return this.client.productCategory.findMany({
      where: { userId },
      select: {
        id: true,
        categoryName: true,
      },
      orderBy: [{ categoryName: "asc" }, { id: "asc" }],
    });
  }

  // 기능 : 현재 사용자의 제품 카테고리 단건을 조회합니다.
  async findCategory(
    userId: string,
    categoryId: string
  ): Promise<ProductCategoryRecord | null> {
    return this.client.productCategory.findFirst({
      where: {
        id: categoryId,
        userId,
      },
      select: {
        id: true,
        categoryName: true,
      },
    });
  }

  // 기능 : 현재 사용자 안에서 같은 제품 카테고리 이름이 있는지 확인합니다.
  async existsCategoryByName(
    userId: string,
    categoryName: string
  ): Promise<boolean> {
    const existing = await this.client.productCategory.findUnique({
      where: {
        userId_categoryName: {
          userId,
          categoryName,
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(existing);
  }

  // 기능 : 현재 사용자의 제품 카테고리를 생성합니다.
  async createCategory(userId: string, categoryName: string): Promise<void> {
    await this.client.productCategory.create({
      data: {
        userId,
        categoryName,
      },
    });
  }

  // 기능 : 현재 사용자의 제품 카테고리를 사용하는 제품이 있는지 확인합니다.
  async isCategoryInUse(userId: string, categoryId: string): Promise<boolean> {
    const product = await this.client.product.findFirst({
      where: {
        userId,
        productCategoryId: categoryId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(product);
  }

  // 기능 : 현재 사용자의 제품 카테고리를 삭제합니다.
  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    await this.client.productCategory.deleteMany({
      where: {
        id: categoryId,
        userId,
      },
    });
  }

  // 기능 : 현재 사용자의 제품 상태 목록을 정렬해 조회합니다.
  async listStatuses(userId: string): Promise<ProductStatusRecord[]> {
    return this.client.productStatus.findMany({
      where: { userId },
      select: {
        id: true,
        statusName: true,
      },
      orderBy: [{ statusName: "asc" }, { id: "asc" }],
    });
  }

  // 기능 : 현재 사용자의 제품 상태 단건을 조회합니다.
  async findStatus(
    userId: string,
    statusId: string
  ): Promise<ProductStatusRecord | null> {
    return this.client.productStatus.findFirst({
      where: {
        id: statusId,
        userId,
      },
      select: {
        id: true,
        statusName: true,
      },
    });
  }

  // 기능 : 현재 사용자 안에서 같은 제품 상태 이름이 있는지 확인합니다.
  async existsStatusByName(userId: string, statusName: string): Promise<boolean> {
    const existing = await this.client.productStatus.findUnique({
      where: {
        userId_statusName: {
          userId,
          statusName,
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(existing);
  }

  // 기능 : 현재 사용자의 제품 상태를 생성합니다.
  async createStatus(userId: string, statusName: string): Promise<void> {
    await this.client.productStatus.create({
      data: {
        userId,
        statusName,
      },
    });
  }

  // 기능 : 현재 사용자의 제품 상태를 사용하는 제품이 있는지 확인합니다.
  async isStatusInUse(userId: string, statusId: string): Promise<boolean> {
    const product = await this.client.product.findFirst({
      where: {
        userId,
        productStatusId: statusId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(product);
  }

  // 기능 : 현재 사용자의 제품 상태를 삭제합니다.
  async deleteStatus(userId: string, statusId: string): Promise<void> {
    await this.client.productStatus.deleteMany({
      where: {
        id: statusId,
        userId,
      },
    });
  }

  // 기능 : 제품 일반 메모 로그를 생성합니다.
  async createMemoLog(input: CreateProductMemoLogInput): Promise<void> {
    await this.client.productMemoLog.create({
      data: {
        productId: input.productId,
        userId: input.userId,
        memoType: input.memoType,
        memo: input.memo,
      },
    });
  }

  // 기능 : 제품 일반 메모 로그를 cursor 조건으로 조회합니다.
  async listMemoLogs(input: {
    readonly userId: string;
    readonly productId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<ProductMemoLogRecord[]> {
    return this.client.productMemoLog.findMany({
      where: {
        userId: input.userId,
        productId: input.productId,
        deletedAt: null,
        ...this.createCursorWhere(input.cursor),
      },
      select: {
        id: true,
        memoType: true,
        memo: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.take,
    });
  }

  // 기능 : 제품 일반 메모 로그의 memoType 또는 memo를 수정합니다.
  async updateMemoLog(input: UpdateProductMemoLogInput): Promise<boolean> {
    const result = await this.client.productMemoLog.updateMany({
      where: {
        id: input.memoLogId,
        productId: input.productId,
        userId: input.userId,
        deletedAt: null,
      },
      data: {
        ...(input.memoType !== undefined ? { memoType: input.memoType } : {}),
        ...(input.memo !== undefined ? { memo: input.memo } : {}),
      },
    });

    return result.count > 0;
  }

  // 기능 : 현재 사용자의 제품을 휴지통 상태로 전환합니다.
  async deleteProduct(input: DeleteProductInput): Promise<boolean> {
    const result = await this.client.product.updateMany({
      where: {
        id: input.productId,
        userId: input.userId,
        deletedAt: null,
      },
      data: {
        deletedAt: input.deletedAt,
        deletedByUserId: input.deletedByUserId,
        trashExpiresAt: input.trashExpiresAt,
      },
    });

    return result.count > 0;
  }

  // 기능 : 제품 일반 메모 로그를 휴지통 상태로 전환합니다.
  async deleteMemoLog(input: DeleteProductMemoLogInput): Promise<boolean> {
    const result = await this.client.productMemoLog.updateMany({
      where: {
        id: input.memoLogId,
        productId: input.productId,
        userId: input.userId,
        deletedAt: null,
      },
      data: {
        deletedAt: input.deletedAt,
        deletedByUserId: input.deletedByUserId,
        trashExpiresAt: input.trashExpiresAt,
      },
    });

    return result.count > 0;
  }

  // 기능 : 제품 개인 비밀 메모 로그를 생성합니다.
  async createPrivateMemoLog(
    input: CreateProductPrivateMemoLogInput
  ): Promise<void> {
    await this.client.productUserPrivateMemoLog.create({
      data: {
        productId: input.productId,
        userId: input.userId,
        memoCiphertext: input.memoCiphertext,
        memoKeyVersion: input.memoKeyVersion,
      },
    });
  }

  // 기능 : 작성자 본인의 제품 개인 비밀 메모 로그를 cursor 조건으로 조회합니다.
  async listPrivateMemoLogs(input: {
    readonly userId: string;
    readonly productId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<ProductPrivateMemoLogRecord[]> {
    return this.client.productUserPrivateMemoLog.findMany({
      where: {
        userId: input.userId,
        productId: input.productId,
        deletedAt: null,
        ...this.createPrivateMemoCursorWhere(input.cursor),
      },
      select: {
        id: true,
        memoCiphertext: true,
        memoKeyVersion: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.take,
    });
  }

  // 기능 : 제품 개인 비밀 메모 로그의 암호문과 key version만 수정합니다.
  async updatePrivateMemoLog(input: {
    readonly userId: string;
    readonly productId: string;
    readonly privateMemoLogId: string;
    readonly memoCiphertext: string;
    readonly memoKeyVersion: string;
  }): Promise<boolean> {
    const result = await this.client.productUserPrivateMemoLog.updateMany({
      where: {
        id: input.privateMemoLogId,
        userId: input.userId,
        productId: input.productId,
        deletedAt: null,
      },
      data: {
        memoCiphertext: input.memoCiphertext,
        memoKeyVersion: input.memoKeyVersion,
      },
    });

    return result.count > 0;
  }

  // 기능 : 제품 개인 비밀 메모 로그를 휴지통 상태로 전환합니다.
  async deletePrivateMemoLog(
    input: DeleteProductPrivateMemoLogInput
  ): Promise<boolean> {
    const result = await this.client.productUserPrivateMemoLog.updateMany({
      where: {
        id: input.privateMemoLogId,
        userId: input.userId,
        productId: input.productId,
        deletedAt: null,
      },
      data: {
        deletedAt: input.deletedAt,
        deletedByUserId: input.deletedByUserId,
        trashExpiresAt: input.trashExpiresAt,
      },
    });

    return result.count > 0;
  }

  // 기능 : cursor 기준보다 이전 데이터만 조회하는 Prisma 조건을 생성합니다.
  private createCursorWhere(
    cursor: MemoLogCursor | null
  ): Prisma.ProductMemoLogWhereInput {
    if (!cursor) {
      return {};
    }

    return {
      OR: [
        {
          createdAt: {
            lt: cursor.createdAt,
          },
        },
        {
          createdAt: cursor.createdAt,
          id: {
            lt: cursor.id,
          },
        },
      ],
    };
  }

  // 기능 : 개인 비밀 메모 cursor 기준보다 이전 데이터만 조회하는 Prisma 조건을 생성합니다.
  private createPrivateMemoCursorWhere(
    cursor: MemoLogCursor | null
  ): Prisma.ProductUserPrivateMemoLogWhereInput {
    if (!cursor) {
      return {};
    }

    return {
      OR: [
        {
          createdAt: {
            lt: cursor.createdAt,
          },
        },
        {
          createdAt: cursor.createdAt,
          id: {
            lt: cursor.id,
          },
        },
      ],
    };
  }

  // 기능 : 제품 목록과 export에 공통으로 쓰는 Prisma 조회 조건을 생성합니다.
  private createProductWhere(
    input: ExportProductsInput
  ): Prisma.ProductWhereInput {
    return {
      userId: input.userId,
      deletedAt: null,
      ...(input.productName
        ? {
            productName: {
              contains: input.productName,
            },
          }
        : {}),
      ...(input.productCategoryIds && input.productCategoryIds.length > 0
        ? { productCategoryId: { in: [...input.productCategoryIds] } }
        : input.productCategoryId
          ? { productCategoryId: input.productCategoryId }
          : {}),
      ...(input.productStatusIds && input.productStatusIds.length > 0
        ? { productStatusId: { in: [...input.productStatusIds] } }
        : input.productStatusId
          ? { productStatusId: input.productStatusId }
          : {}),
    };
  }

  // 기능 : 제품 목록과 export에 필요한 relation과 딜 수 집계를 정의합니다.
  private createProductListInclude(userId: string): Prisma.ProductInclude {
    return {
      productCategory: true,
      productStatus: true,
      _count: {
        select: {
          dealProducts: {
            where: {
              userId,
            },
          },
        },
      },
    };
  }

  // 기능 : 제품 목록과 export의 정렬 조건을 생성합니다.
  private createProductOrderBy(
    sort: ProductListSort | undefined
  ): Prisma.ProductOrderByWithRelationInput[] {
    if (
      sort === ProductListSort.DEAL_COUNT_DESC ||
      sort === ProductListSort.DEAL_COUNT_ASC
    ) {
      return [
        {
          dealProducts: {
            _count:
              sort === ProductListSort.DEAL_COUNT_DESC ? "desc" : "asc",
          },
        },
        { createdAt: "desc" },
        { id: "desc" },
      ];
    }

    return [{ createdAt: "desc" }, { id: "desc" }];
  }

  // 기능 : Prisma 제품 행을 application 레코드로 변환합니다.
  private mapProduct(product: ProductWithRelations): ProductRecord {
    return {
      id: product.id,
      productName: product.productName,
      productPrice: product.productPrice,
      productCategory: {
        id: product.productCategory.id,
        categoryName: product.productCategory.categoryName,
      },
      productStatus: {
        id: product.productStatus.id,
        statusName: product.productStatus.statusName,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  // 기능 : Prisma 제품 목록 행을 dealCount 포함 application 레코드로 변환합니다.
  private mapProductList(product: ProductListWithRelations): ProductListRecord {
    return {
      ...this.mapProduct(product),
      dealCount: product._count.dealProducts,
    };
  }
}
