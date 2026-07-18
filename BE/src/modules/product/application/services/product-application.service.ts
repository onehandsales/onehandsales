import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import {
  PRODUCT_PRIVATE_MEMO_ENCRYPTION_PORT,
  type ProductPrivateMemoEncryptionPort,
} from "@/modules/product/application/ports/product-private-memo-encryption.port";
import {
  PRODUCT_REPOSITORY,
  type MemoLogCursor,
  type ProductCategoryRecord,
  type ProductDealRecord,
  type ProductListRecord,
  ProductListSort,
  type ProductMemoLogRecord,
  type ProductPrivateMemoLogRecord,
  type ProductRecord,
  type ProductRepository,
  type ProductStatusRecord,
  type UpdateProductInput,
} from "@/modules/product/application/ports/product.repository";
import {
  DuplicateProductCategoryError,
  DuplicateProductStatusError,
  ProductCategoryInUseError,
  ProductCategoryNotFoundError,
  ProductExportFailedError,
  ProductMemoLogNotFoundError,
  ProductNotFoundError,
  ProductPrivateMemoLogNotFoundError,
  ProductStatusInUseError,
  ProductStatusNotFoundError,
} from "@/modules/product/domain/product.errors";
import {
  createTimestampedXlsxFileName,
  type ExportedXlsxFileResponse,
  XLSX_CONTENT_TYPE,
} from "@/shared/application/export/xlsx-export-file";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  XLSX_WORKBOOK_WRITER,
  type XlsxRow,
  type XlsxWorkbookWriter,
} from "@/shared/application/ports/xlsx-workbook.writer";
import { createTrashRetentionTimestamps } from "@/shared/application/trash/trash-retention";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const PRODUCT_PAGE_SIZE = 15;
const MEMO_LOG_PAGE_SIZE = 10;
const INITIAL_PRODUCT_MEMO_TYPE = "초기 메모";
const XLSX_DATE_NUM_FORMAT = "yyyy-mm-dd hh:mm:ss";

// 역할 : ProductListQueryInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductListQueryInput {
  readonly page?: number;
  readonly productName?: string;
  readonly productCategoryId?: string;
  readonly productCategoryIds?: readonly string[];
  readonly productStatusId?: string;
  readonly productStatusIds?: readonly string[];
  readonly sort?: ProductListSort;
}

// 역할 : ProductExportQueryInput 제품 export query 조건을 정의합니다.
export interface ProductExportQueryInput {
  readonly productName?: string;
  readonly productCategoryId?: string;
  readonly productCategoryIds?: readonly string[];
  readonly productStatusId?: string;
  readonly productStatusIds?: readonly string[];
  readonly sort?: ProductListSort;
}

// 역할 : CreateProductCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateProductCommand {
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategoryId: string;
  readonly productStatusId: string;
  readonly productMemo?: string | null;
}

// 역할 : UpdateProductCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateProductCommand {
  readonly productName?: string;
  readonly productPrice?: number;
  readonly productCategoryId?: string;
  readonly productStatusId?: string;
}

// 역할 : CursorQueryInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CursorQueryInput {
  readonly cursor?: string;
}

// 역할 : ProductPageResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductPageResponse {
  readonly items: ProductListItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

// 역할 : ProductListItemResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductListItemResponse {
  readonly id: string;
  readonly productName: string;
  readonly productCategory: ProductCategoryRecord;
  readonly productStatus: ProductStatusRecord;
  readonly dealCount: number;
  readonly createdAt: string;
}

// 역할 : ProductDetailResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductDetailResponse {
  readonly id: string;
  readonly productName: string;
  readonly productCategory: ProductCategoryRecord;
  readonly productStatus: ProductStatusRecord;
  readonly productPrice: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : ProductDealListResponse 제품에 연결된 딜 목록 응답을 정의합니다.
export interface ProductDealListResponse {
  readonly items: ProductDealItemResponse[];
}

// 역할 : ProductDealItemResponse 제품에 연결된 딜 응답 항목을 정의합니다.
export interface ProductDealItemResponse {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: string;
  readonly createdAt: string;
}

// 역할 : ProductCategoryListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductCategoryListResponse {
  readonly items: ProductCategoryRecord[];
}

// 역할 : ProductStatusListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductStatusListResponse {
  readonly items: ProductStatusRecord[];
}

// 역할 : ProductMemoLogConnectionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductMemoLogConnectionResponse {
  readonly items: Array<{
    readonly id: string;
    readonly memoType: string;
    readonly memo: string;
    readonly createdAt: string;
  }>;
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

// 역할 : ProductPrivateMemoLogConnectionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductPrivateMemoLogConnectionResponse {
  readonly items: Array<{
    readonly id: string;
    readonly memo: string;
    readonly createdAt: string;
  }>;
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

// 역할 : ProductApplicationService 제품 도메인 application 유스케이스를 제공합니다.
@Injectable()
export class ProductApplicationService {
  // 기능 : 제품 저장소, 개인 비밀 메모 암호화 포트, 로그 서비스를 주입받습니다.
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(PRODUCT_PRIVATE_MEMO_ENCRYPTION_PORT)
    private readonly privateMemoEncryption: ProductPrivateMemoEncryptionPort,
    @Inject(XLSX_WORKBOOK_WRITER)
    private readonly xlsxWriter: XlsxWorkbookWriter,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 현재 사용자의 제품 목록을 15개 단위 페이지로 조회합니다.
  async listProducts(
    currentUser: CurrentUserContext,
    query: ProductListQueryInput
  ): Promise<ProductPageResponse> {
    // 1. 목록 조회 조건을 기본값과 검색 가능한 텍스트로 정규화한다.
    const page = query.page ?? 1;
    const productName = this.normalizeOptionalText(query.productName);
    const productCategoryIds = this.normalizeFilterIds(
      query.productCategoryId,
      query.productCategoryIds
    );
    const productStatusIds = this.normalizeFilterIds(
      query.productStatusId,
      query.productStatusIds
    );

    // 2. 필터로 받은 제품 카테고리와 상태가 현재 사용자 소유인지 검증한다.
    await this.assertCategoriesExist(currentUser.id, productCategoryIds);
    await this.assertStatusesExist(currentUser.id, productStatusIds);

    // 3. 현재 사용자 ownership 기준으로 제품 목록을 조회한다.
    const result = await this.productRepository.listProducts({
      userId: currentUser.id,
      page,
      pageSize: PRODUCT_PAGE_SIZE,
      ...(productName ? { productName } : {}),
      ...(productCategoryIds.length > 0 ? { productCategoryIds } : {}),
      ...(productStatusIds.length > 0 ? { productStatusIds } : {}),
      sort: query.sort ?? ProductListSort.CREATED_AT_DESC,
    });

    // 4. 민감한 검색어 없이 목록 조회 이벤트를 기록한다.
    this.logEvent("product.listed", {
      userId: currentUser.id,
      sort: query.sort ?? ProductListSort.CREATED_AT_DESC,
    });

    // 5. repository 결과를 페이지 응답 DTO로 변환한다.
    return {
      items: result.items.map((product) => this.toProductListItem(product)),
      page,
      pageSize: PRODUCT_PAGE_SIZE,
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / PRODUCT_PAGE_SIZE),
    };
  }

  // 기능 : 검색과 필터가 반영된 제품 목록을 xlsx 파일로 생성합니다.
  async exportProductsXlsx(
    currentUser: CurrentUserContext,
    query: ProductExportQueryInput
  ): Promise<ExportedXlsxFileResponse> {
    // 1. export 조회 조건을 저장소 입력에 맞게 정규화한다.
    const productName = this.normalizeOptionalText(query.productName);
    const productCategoryIds = this.normalizeFilterIds(
      query.productCategoryId,
      query.productCategoryIds
    );
    const productStatusIds = this.normalizeFilterIds(
      query.productStatusId,
      query.productStatusIds
    );

    // 2. 필터로 받은 제품 카테고리와 상태가 현재 사용자 소유인지 검증한다.
    await this.assertCategoriesExist(currentUser.id, productCategoryIds);
    await this.assertStatusesExist(currentUser.id, productStatusIds);

    // 3. 페이지네이션 없이 현재 검색과 필터에 맞는 제품 전체 목록을 조회한다.
    const products = await this.productRepository.listProductsForExport({
      userId: currentUser.id,
      ...(productName ? { productName } : {}),
      ...(productCategoryIds.length > 0 ? { productCategoryIds } : {}),
      ...(productStatusIds.length > 0 ? { productStatusIds } : {}),
      sort: query.sort ?? ProductListSort.CREATED_AT_DESC,
    });

    // 4. xlsx writer로 다운로드 파일 본문을 생성한다.
    const content = await this.writeProductExportXlsx(products);

    // 5. 검색어 없이 제품 export 이벤트를 기록한다.
    this.logEvent("product.exported", {
      userId: currentUser.id,
      rowCount: products.length,
      sort: query.sort ?? ProductListSort.CREATED_AT_DESC,
    });

    // 6. controller가 다운로드 응답으로 변환할 파일 정보를 반환한다.
    return {
      fileName: createTimestampedXlsxFileName("products"),
      contentType: XLSX_CONTENT_TYPE,
      content,
    };
  }

  // 기능 : 현재 사용자의 제품 카테고리 목록을 조회합니다.
  async listCategories(
    currentUser: CurrentUserContext
  ): Promise<ProductCategoryListResponse> {
    // 1. 현재 사용자 소유의 제품 카테고리 목록을 조회한다.
    const items = await this.productRepository.listCategories(currentUser.id);

    // 2. 제품 카테고리 목록 조회 이벤트를 기록한다.
    this.logEvent("productCategory.listed", { userId: currentUser.id });

    // 3. 제품 카테고리 목록 응답 DTO로 반환한다.
    return { items };
  }

  // 기능 : 현재 사용자의 제품 상태 목록을 조회합니다.
  async listStatuses(
    currentUser: CurrentUserContext
  ): Promise<ProductStatusListResponse> {
    // 1. 현재 사용자 소유의 제품 상태 목록을 조회한다.
    const items = await this.productRepository.listStatuses(currentUser.id);

    // 2. 제품 상태 목록 조회 이벤트를 기록한다.
    this.logEvent("productStatus.listed", { userId: currentUser.id });

    // 3. 제품 상태 목록 응답 DTO로 반환한다.
    return { items };
  }

  // 기능 : 현재 사용자의 제품 단건 상세를 조회합니다.
  async getProduct(
    currentUser: CurrentUserContext,
    productId: string
  ): Promise<ProductDetailResponse> {
    // 1. 현재 사용자 ownership 기준으로 제품 단건을 조회한다.
    const product = await this.productRepository.findProduct(
      currentUser.id,
      productId
    );

    // 2. 제품이 없으면 domain 오류로 중단한다.
    if (!product) {
      throw new ProductNotFoundError();
    }

    // 3. 제품 조회 이벤트를 기록한다.
    this.logEvent("product.viewed", {
      userId: currentUser.id,
      productId,
    });

    // 4. 제품 상세 응답 DTO로 변환한다.
    return this.toProductDetail(product);
  }

  // 기능 : 현재 사용자의 제품에 연결된 딜 전체 목록을 조회합니다.
  async listProductDeals(
    currentUser: CurrentUserContext,
    productId: string
  ): Promise<ProductDealListResponse> {
    // 1. 조회 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. 현재 사용자 ownership 기준으로 제품에 연결된 딜 목록을 조회한다.
    const deals = await this.productRepository.listProductDeals({
      userId: currentUser.id,
      productId,
    });

    // 3. 민감한 딜 본문 없이 제품별 딜 목록 조회 이벤트를 기록한다.
    this.logEvent("product.dealsListed", {
      userId: currentUser.id,
      productId,
    });

    // 4. repository 결과를 응답 DTO로 변환한다.
    return {
      items: deals.map((deal) => this.toProductDealItem(deal)),
    };
  }

  // 기능 : 제품을 생성하고 선택 메모가 있으면 같은 트랜잭션에서 첫 메모 로그를 생성합니다.
  async createProduct(
    currentUser: CurrentUserContext,
    input: CreateProductCommand
  ): Promise<void> {
    // 1. 제품 기본 입력값과 초기 메모를 저장 가능한 형태로 정규화한다.
    const productName = this.normalizeRequiredText(
      input.productName,
      "productName is required"
    );
    const productPrice = this.normalizeProductPrice(input.productPrice);
    const productMemo = this.normalizeOptionalText(input.productMemo);
    let createdProductId: string | null = null;

    // 2. 제품 생성과 초기 메모 생성을 같은 transaction 안에서 실행한다.
    await this.productRepository.runInTransaction(async (repository) => {
      // 3. 제품 카테고리와 제품 상태가 현재 사용자 소유인지 검증한다.
      await this.assertCategoryExists(
        currentUser.id,
        input.productCategoryId,
        repository
      );
      await this.assertStatusExists(
        currentUser.id,
        input.productStatusId,
        repository
      );

      // 4. 제품 본문 데이터를 생성한다.
      const product = await repository.createProduct({
        userId: currentUser.id,
        productName,
        productPrice,
        productCategoryId: input.productCategoryId,
        productStatusId: input.productStatusId,
      });
      createdProductId = product.id;

      // 5. 초기 메모가 있으면 일반 메모 로그 첫 데이터로 저장한다.
      if (productMemo) {
        await repository.createMemoLog({
          productId: product.id,
          userId: currentUser.id,
          memoType: INITIAL_PRODUCT_MEMO_TYPE,
          memo: productMemo,
        });
      }
    });

    // 6. 민감한 입력값 없이 제품 생성 이벤트를 기록한다.
    this.logEvent("product.created", {
      userId: currentUser.id,
      productId: createdProductId,
    });
  }

  // 기능 : 제품명, 제품가격, 제품 카테고리, 제품 상태 중 요청에 포함된 값만 수정합니다.
  async updateProduct(
    currentUser: CurrentUserContext,
    productId: string,
    input: UpdateProductCommand
  ): Promise<void> {
    // 1. 수정 요청에서 포함된 필드만 저장 입력으로 정규화한다.
    const updateInput = this.normalizeProductUpdateInput(input);

    // 2. 수정할 필드가 하나 이상 있는지 검증한다.
    if (Object.keys(updateInput).length === 0) {
      throw new ValidationDomainError("At least one product field is required");
    }

    // 3. 수정 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 4. 변경할 제품 카테고리와 상태가 현재 사용자 소유인지 검증한다.
    if (updateInput.productCategoryId) {
      await this.assertCategoryExists(currentUser.id, updateInput.productCategoryId);
    }

    if (updateInput.productStatusId) {
      await this.assertStatusExists(currentUser.id, updateInput.productStatusId);
    }

    // 5. 제품 기본 정보를 수정한다.
    const updated = await this.productRepository.updateProduct(
      currentUser.id,
      productId,
      updateInput
    );

    // 6. 수정 결과가 없으면 제품 없음 오류로 중단한다.
    if (!updated) {
      throw new ProductNotFoundError();
    }

    // 7. 민감한 입력값 없이 제품 수정 이벤트를 기록한다.
    this.logEvent("product.updated", { userId: currentUser.id, productId });
  }

  // 기능 : 현재 사용자의 제품을 휴지통 상태로 전환합니다.
  async deleteProduct(
    currentUser: CurrentUserContext,
    productId: string
  ): Promise<void> {
    // 1. 삭제 대상 제품이 현재 사용자 소유의 활성 제품인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. 휴지통 보관 정책에 맞는 삭제 시각과 만료 시각을 계산한다.
    const timestamps = createTrashRetentionTimestamps();

    // 3. 제품 자체만 휴지통 상태로 전환하고 기존 딜 연결 row는 유지한다.
    const deleted = await this.productRepository.deleteProduct({
      userId: currentUser.id,
      productId,
      deletedAt: timestamps.deletedAt,
      deletedByUserId: currentUser.id,
      trashExpiresAt: timestamps.trashExpiresAt,
    });

    // 4. 삭제 결과가 없으면 제품 없음 오류로 중단한다.
    if (!deleted) {
      throw new ProductNotFoundError();
    }

    // 5. 민감한 입력값 없이 제품 삭제 이벤트를 기록한다.
    this.logEvent("product.deleted", { userId: currentUser.id, productId });
  }

  // 기능 : 현재 사용자의 제품 카테고리를 생성합니다.
  async createCategory(
    currentUser: CurrentUserContext,
    categoryName: string
  ): Promise<void> {
    // 1. 카테고리명을 저장 가능한 필수 텍스트로 정규화한다.
    const normalizedCategoryName = this.normalizeRequiredText(
      categoryName,
      "categoryName is required"
    );

    // 2. 현재 사용자 안에서 같은 카테고리명이 이미 있는지 검증한다.
    if (
      await this.productRepository.existsCategoryByName(
        currentUser.id,
        normalizedCategoryName
      )
    ) {
      throw new DuplicateProductCategoryError();
    }

    // 3. 현재 사용자 소유의 제품 카테고리를 생성한다.
    await this.productRepository.createCategory(
      currentUser.id,
      normalizedCategoryName
    );

    // 4. 제품 카테고리 생성 이벤트를 기록한다.
    this.logEvent("productCategory.created", { userId: currentUser.id });
  }

  // 기능 : 사용 중이 아닌 현재 사용자의 제품 카테고리를 삭제합니다.
  async deleteCategory(
    currentUser: CurrentUserContext,
    categoryId: string
  ): Promise<void> {
    // 1. 삭제 대상 카테고리가 현재 사용자 소유인지 검증한다.
    await this.assertCategoryExists(currentUser.id, categoryId);

    // 2. 제품에서 사용 중인 카테고리인지 검증한다.
    if (await this.productRepository.isCategoryInUse(currentUser.id, categoryId)) {
      throw new ProductCategoryInUseError();
    }

    // 3. 사용 중이 아닌 카테고리를 삭제한다.
    await this.productRepository.deleteCategory(currentUser.id, categoryId);

    // 4. 제품 카테고리 삭제 이벤트를 기록한다.
    this.logEvent("productCategory.deleted", {
      userId: currentUser.id,
      categoryId,
    });
  }

  // 기능 : 현재 사용자의 제품 상태를 생성합니다.
  async createStatus(
    currentUser: CurrentUserContext,
    statusName: string
  ): Promise<void> {
    // 1. 상태명을 저장 가능한 필수 텍스트로 정규화한다.
    const normalizedStatusName = this.normalizeRequiredText(
      statusName,
      "statusName is required"
    );

    // 2. 현재 사용자 안에서 같은 상태명이 이미 있는지 검증한다.
    if (
      await this.productRepository.existsStatusByName(
        currentUser.id,
        normalizedStatusName
      )
    ) {
      throw new DuplicateProductStatusError();
    }

    // 3. 현재 사용자 소유의 제품 상태를 생성한다.
    await this.productRepository.createStatus(currentUser.id, normalizedStatusName);

    // 4. 제품 상태 생성 이벤트를 기록한다.
    this.logEvent("productStatus.created", { userId: currentUser.id });
  }

  // 기능 : 사용 중이 아닌 현재 사용자의 제품 상태를 삭제합니다.
  async deleteStatus(
    currentUser: CurrentUserContext,
    statusId: string
  ): Promise<void> {
    // 1. 삭제 대상 상태가 현재 사용자 소유인지 검증한다.
    await this.assertStatusExists(currentUser.id, statusId);

    // 2. 제품에서 사용 중인 상태인지 검증한다.
    if (await this.productRepository.isStatusInUse(currentUser.id, statusId)) {
      throw new ProductStatusInUseError();
    }

    // 3. 사용 중이 아닌 상태를 삭제한다.
    await this.productRepository.deleteStatus(currentUser.id, statusId);

    // 4. 제품 상태 삭제 이벤트를 기록한다.
    this.logEvent("productStatus.deleted", {
      userId: currentUser.id,
      statusId,
    });
  }

  // 기능 : 현재 사용자의 제품에 일반 메모 로그를 생성합니다.
  async createMemoLog(
    currentUser: CurrentUserContext,
    productId: string,
    input: { readonly memoType: string; readonly memo: string }
  ): Promise<void> {
    // 1. 메모 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. 메모 유형과 본문을 정규화해 일반 메모 로그로 저장한다.
    await this.productRepository.createMemoLog({
      productId,
      userId: currentUser.id,
      memoType: this.normalizeRequiredText(input.memoType, "memoType is required"),
      memo: this.normalizeRequiredText(input.memo, "memo is required"),
    });

    // 3. 메모 원문 없이 일반 메모 로그 생성 이벤트를 기록한다.
    this.logEvent("productMemoLog.created", {
      userId: currentUser.id,
      productId,
    });
  }

  // 기능 : 현재 사용자의 제품 일반 메모 로그를 10개 단위 cursor 방식으로 조회합니다.
  async listMemoLogs(
    currentUser: CurrentUserContext,
    productId: string,
    query: CursorQueryInput
  ): Promise<ProductMemoLogConnectionResponse> {
    // 1. 조회 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. cursor 조건으로 일반 메모 로그를 페이지 크기보다 1개 더 조회한다.
    const records = await this.productRepository.listMemoLogs({
      userId: currentUser.id,
      productId,
      cursor: this.parseCursor(query.cursor),
      take: MEMO_LOG_PAGE_SIZE + 1,
    });

    // 3. 메모 원문 없이 일반 메모 로그 조회 이벤트를 기록한다.
    this.logEvent("productMemoLog.listed", {
      userId: currentUser.id,
      productId,
    });

    // 4. 조회 결과를 cursor connection 응답으로 변환한다.
    return this.toMemoLogConnection(records);
  }

  // 기능 : 현재 사용자의 제품 일반 메모 로그 유형 또는 본문을 수정합니다.
  async updateMemoLog(
    currentUser: CurrentUserContext,
    productId: string,
    memoLogId: string,
    input: { readonly memoType?: string; readonly memo?: string }
  ): Promise<void> {
    // 1. 메모 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. 일반 메모 로그 수정 입력을 포함된 필드만 정규화한다.
    const updateInput = this.normalizeMemoLogUpdateInput(input);

    // 3. 일반 메모 로그 유형 또는 본문을 수정한다.
    const updated = await this.productRepository.updateMemoLog({
      userId: currentUser.id,
      productId,
      memoLogId,
      ...(updateInput.memoType !== undefined
        ? { memoType: updateInput.memoType }
        : {}),
      ...(updateInput.memo !== undefined ? { memo: updateInput.memo } : {}),
    });

    // 4. 수정 대상 메모 로그가 없으면 오류로 중단한다.
    if (!updated) {
      throw new ProductMemoLogNotFoundError();
    }

    // 5. 메모 원문 없이 일반 메모 로그 수정 이벤트를 기록한다.
    this.logEvent("productMemoLog.updated", {
      userId: currentUser.id,
      productId,
      memoLogId,
    });
  }

  // 기능 : 현재 사용자의 제품 일반 메모 로그를 휴지통 상태로 전환합니다.
  async deleteMemoLog(
    currentUser: CurrentUserContext,
    productId: string,
    memoLogId: string
  ): Promise<void> {
    // 1. 메모 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. 일반 메모 로그를 휴지통 보관 정책에 맞춰 삭제 상태로 전환한다.
    const timestamps = createTrashRetentionTimestamps();
    const deleted = await this.productRepository.deleteMemoLog({
      userId: currentUser.id,
      productId,
      memoLogId,
      deletedByUserId: currentUser.id,
      ...timestamps,
    });

    // 3. 삭제 대상 메모 로그가 없으면 오류로 중단한다.
    if (!deleted) {
      throw new ProductMemoLogNotFoundError();
    }

    this.logEvent("productMemoLog.deleted", {
      userId: currentUser.id,
      productId,
      memoLogId,
    });
  }

  // 기능 : 현재 사용자의 제품에 암호화된 개인 비밀 메모 로그를 생성합니다.
  async createPrivateMemoLog(
    currentUser: CurrentUserContext,
    productId: string,
    memo: string
  ): Promise<void> {
    // 1. 비밀 메모 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. 비밀 메모 본문을 정규화한 뒤 암호화한다.
    const encrypted = this.privateMemoEncryption.encrypt(
      this.normalizeRequiredText(memo, "memo is required")
    );

    // 3. 암호문과 key version만 저장소에 저장한다.
    await this.productRepository.createPrivateMemoLog({
      productId,
      userId: currentUser.id,
      memoCiphertext: encrypted.ciphertext,
      memoKeyVersion: encrypted.keyVersion,
    });

    // 4. 비밀 메모 원문과 암호문 없이 생성 이벤트를 기록한다.
    this.logEvent("productPrivateMemoLog.created", {
      userId: currentUser.id,
      productId,
    });
  }

  // 기능 : 현재 사용자가 작성한 제품 개인 비밀 메모 로그만 복호화해 조회합니다.
  async listPrivateMemoLogs(
    currentUser: CurrentUserContext,
    productId: string,
    query: CursorQueryInput
  ): Promise<ProductPrivateMemoLogConnectionResponse> {
    // 1. 조회 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. 현재 사용자가 작성한 비밀 메모 로그를 cursor 조건으로 조회한다.
    const records = await this.productRepository.listPrivateMemoLogs({
      userId: currentUser.id,
      productId,
      cursor: this.parseCursor(query.cursor),
      take: MEMO_LOG_PAGE_SIZE + 1,
    });

    // 3. 비밀 메모 원문과 암호문 없이 조회 이벤트를 기록한다.
    this.logEvent("productPrivateMemoLog.listed", {
      userId: currentUser.id,
      productId,
    });

    // 4. 암호화된 메모 목록을 복호화된 cursor connection 응답으로 변환한다.
    return this.toPrivateMemoLogConnection(records);
  }

  // 기능 : 현재 사용자의 제품 개인 비밀 메모 로그 본문만 다시 암호화해 수정합니다.
  async updatePrivateMemoLog(
    currentUser: CurrentUserContext,
    productId: string,
    privateMemoLogId: string,
    memo: string
  ): Promise<void> {
    // 1. 비밀 메모 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. 새 비밀 메모 본문을 정규화한 뒤 암호화한다.
    const encrypted = this.privateMemoEncryption.encrypt(
      this.normalizeRequiredText(memo, "memo is required")
    );

    // 3. 작성자와 제품 소유권 조건으로 비밀 메모 로그를 수정한다.
    const updated = await this.productRepository.updatePrivateMemoLog({
      userId: currentUser.id,
      productId,
      privateMemoLogId,
      memoCiphertext: encrypted.ciphertext,
      memoKeyVersion: encrypted.keyVersion,
    });

    // 4. 수정 대상 비밀 메모 로그가 없으면 오류로 중단한다.
    if (!updated) {
      throw new ProductPrivateMemoLogNotFoundError();
    }

    // 5. 비밀 메모 원문과 암호문 없이 수정 이벤트를 기록한다.
    this.logEvent("productPrivateMemoLog.updated", {
      userId: currentUser.id,
      productId,
      privateMemoLogId,
    });
  }

  // 기능 : 현재 사용자의 제품 개인 비밀 메모 로그를 휴지통 상태로 전환합니다.
  async deletePrivateMemoLog(
    currentUser: CurrentUserContext,
    productId: string,
    privateMemoLogId: string
  ): Promise<void> {
    // 1. 비밀 메모 대상 제품이 현재 사용자 소유인지 검증한다.
    await this.assertProductExists(currentUser.id, productId);

    // 2. 비밀 메모 로그를 휴지통 보관 정책에 맞춰 삭제 상태로 전환한다.
    const timestamps = createTrashRetentionTimestamps();
    const deleted = await this.productRepository.deletePrivateMemoLog({
      userId: currentUser.id,
      productId,
      privateMemoLogId,
      deletedByUserId: currentUser.id,
      ...timestamps,
    });

    // 3. 삭제 대상 비밀 메모 로그가 없으면 오류로 중단한다.
    if (!deleted) {
      throw new ProductPrivateMemoLogNotFoundError();
    }

    this.logEvent("productPrivateMemoLog.deleted", {
      userId: currentUser.id,
      productId,
      privateMemoLogId,
    });
  }

  // 기능 : 제품 카테고리가 현재 사용자의 소유인지 확인합니다.
  private async assertCategoryExists(
    userId: string,
    categoryId: string,
    repository: ProductRepository = this.productRepository
  ): Promise<void> {
    if (!(await repository.findCategory(userId, categoryId))) {
      throw new ProductCategoryNotFoundError();
    }
  }

  // 기능 : 제품 상태가 현재 사용자의 소유인지 확인합니다.
  private async assertCategoriesExist(
    userId: string,
    categoryIds: readonly string[]
  ): Promise<void> {
    await Promise.all(
      categoryIds.map((categoryId) =>
        this.assertCategoryExists(userId, categoryId)
      )
    );
  }

  private async assertStatusExists(
    userId: string,
    statusId: string,
    repository: ProductRepository = this.productRepository
  ): Promise<void> {
    if (!(await repository.findStatus(userId, statusId))) {
      throw new ProductStatusNotFoundError();
    }
  }

  // 기능 : 제품이 현재 사용자의 소유인지 확인합니다.
  private async assertStatusesExist(
    userId: string,
    statusIds: readonly string[]
  ): Promise<void> {
    await Promise.all(
      statusIds.map((statusId) => this.assertStatusExists(userId, statusId))
    );
  }

  private async assertProductExists(
    userId: string,
    productId: string
  ): Promise<void> {
    if (!(await this.productRepository.findProductLookup(userId, productId))) {
      throw new ProductNotFoundError();
    }
  }

  // 기능 : 필수 텍스트 입력을 trim하고 비어 있으면 validation 오류를 던집니다.
  private normalizeRequiredText(value: string, message: string): string {
    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(message);
    }

    return normalized;
  }

  // 기능 : 선택 텍스트 입력을 trim하고 비어 있으면 undefined로 변환합니다.
  private normalizeOptionalText(value: string | null | undefined): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  // 기능 : 제품 가격 입력이 0 이상 정수인지 검증합니다.
  private normalizeFilterIds(
    singleId: string | undefined,
    ids: readonly string[] | undefined
  ): string[] {
    const normalizedIds: string[] = [];

    for (const id of [singleId, ...(ids ?? [])]) {
      const normalizedId = this.normalizeOptionalText(id);

      if (normalizedId && !normalizedIds.includes(normalizedId)) {
        normalizedIds.push(normalizedId);
      }
    }

    return normalizedIds;
  }

  private normalizeProductPrice(value: number): number {
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationDomainError("productPrice must be an integer >= 0");
    }

    return value;
  }

  // 기능 : 제품 수정 요청에서 포함된 필드만 저장 가능한 값으로 정규화합니다.
  private normalizeProductUpdateInput(input: UpdateProductCommand): UpdateProductInput {
    return {
      ...(input.productName !== undefined
        ? {
            productName: this.normalizeRequiredText(
              input.productName,
              "productName is required"
            ),
          }
        : {}),
      ...(input.productPrice !== undefined
        ? { productPrice: this.normalizeProductPrice(input.productPrice) }
        : {}),
      ...(input.productCategoryId !== undefined
        ? { productCategoryId: input.productCategoryId }
        : {}),
      ...(input.productStatusId !== undefined
        ? { productStatusId: input.productStatusId }
        : {}),
    };
  }

  // 기능 : 제품 일반 메모 수정 요청에서 포함된 필드만 저장 가능한 값으로 정규화합니다.
  private normalizeMemoLogUpdateInput(input: {
    readonly memoType?: string;
    readonly memo?: string;
  }): { readonly memoType?: string; readonly memo?: string } {
    const normalized = {
      ...(input.memoType !== undefined
        ? {
            memoType: this.normalizeRequiredText(
              input.memoType,
              "memoType is required"
            ),
          }
        : {}),
      ...(input.memo !== undefined
        ? { memo: this.normalizeRequiredText(input.memo, "memo is required") }
        : {}),
    };

    if (Object.keys(normalized).length === 0) {
      throw new ValidationDomainError("At least one memo field is required");
    }

    return normalized;
  }

  // 기능 : 서버가 발급한 cursor 문자열을 조회 조건으로 복원합니다.
  private parseCursor(cursor: string | undefined): MemoLogCursor | null {
    if (!cursor) {
      return null;
    }

    try {
      const raw = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));

      if (!this.isCursorPayload(raw)) {
        throw new Error("Invalid cursor payload");
      }

      const createdAt = new Date(raw.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        throw new Error("Invalid cursor date");
      }

      return {
        createdAt,
        id: raw.id,
      };
    } catch {
      throw new ValidationDomainError("Cursor is invalid");
    }
  }

  // 기능 : cursor payload가 필요한 필드를 가진 객체인지 확인합니다.
  private isCursorPayload(
    value: unknown
  ): value is { readonly createdAt: string; readonly id: string } {
    return (
      typeof value === "object" &&
      value !== null &&
      "createdAt" in value &&
      "id" in value &&
      typeof value.createdAt === "string" &&
      typeof value.id === "string"
    );
  }

  // 기능 : 응답용 다음 페이지 cursor 문자열을 생성합니다.
  private createCursor(record: { readonly createdAt: Date; readonly id: string }): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: record.createdAt.toISOString(),
        id: record.id,
      }),
      "utf8"
    ).toString("base64url");
  }

  // 기능 : 제품 레코드를 목록 응답 항목으로 변환합니다.
  private toProductListItem(product: ProductListRecord): ProductListItemResponse {
    return {
      id: product.id,
      productName: product.productName,
      productCategory: product.productCategory,
      productStatus: product.productStatus,
      dealCount: product.dealCount,
      createdAt: product.createdAt.toISOString(),
    };
  }

  // 기능 : 제품 레코드를 단건 상세 응답으로 변환합니다.
  private toProductDetail(product: ProductRecord): ProductDetailResponse {
    return {
      id: product.id,
      productName: product.productName,
      productCategory: product.productCategory,
      productStatus: product.productStatus,
      productPrice: product.productPrice,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  // 기능 : 제품에 연결된 딜 레코드를 응답 항목으로 변환합니다.
  private toProductDealItem(deal: ProductDealRecord): ProductDealItemResponse {
    return {
      id: deal.id,
      dealName: deal.dealName,
      dealCost: deal.dealCost,
      dealStatus: deal.dealStatus,
      createdAt: deal.createdAt.toISOString(),
    };
  }

  // 기능 : 제품 export 레코드를 xlsx Buffer로 변환합니다.
  private async writeProductExportXlsx(
    products: ProductListRecord[]
  ): Promise<Buffer> {
    try {
      return await this.xlsxWriter.writeWorksheet({
        sheetName: "Products",
        columns: [
          { header: "제품명", key: "productName", width: 28 },
          { header: "카테고리", key: "categoryName", width: 18 },
          { header: "상태", key: "statusName", width: 18 },
          { header: "딜 수", key: "dealCount", width: 12 },
          {
            header: "등록일",
            key: "createdAt",
            width: 22,
            numFmt: XLSX_DATE_NUM_FORMAT,
          },
        ],
        rows: this.toProductExportRows(products),
      });
    } catch {
      throw new ProductExportFailedError();
    }
  }

  // 기능 : 제품 export 레코드를 ID 없는 xlsx 행 데이터로 변환합니다.
  private toProductExportRows(products: ProductListRecord[]): XlsxRow[] {
    return products.map((product) => ({
      productName: product.productName,
      categoryName: product.productCategory.categoryName,
      statusName: product.productStatus.statusName,
      dealCount: product.dealCount,
      createdAt: product.createdAt,
    }));
  }

  // 기능 : 일반 메모 로그 목록을 cursor connection 응답으로 변환합니다.
  private toMemoLogConnection(
    records: ProductMemoLogRecord[]
  ): ProductMemoLogConnectionResponse {
    const items = records.slice(0, MEMO_LOG_PAGE_SIZE);
    const hasNext = records.length > MEMO_LOG_PAGE_SIZE;
    const lastItem = items[items.length - 1] ?? null;

    return {
      items: items.map((record) => ({
        id: record.id,
        memoType: record.memoType,
        memo: record.memo,
        createdAt: record.createdAt.toISOString(),
      })),
      nextCursor: hasNext && lastItem ? this.createCursor(lastItem) : null,
      hasNext,
    };
  }

  // 기능 : 개인 비밀 메모 로그 목록을 복호화된 cursor connection 응답으로 변환합니다.
  private toPrivateMemoLogConnection(
    records: ProductPrivateMemoLogRecord[]
  ): ProductPrivateMemoLogConnectionResponse {
    const items = records.slice(0, MEMO_LOG_PAGE_SIZE);
    const hasNext = records.length > MEMO_LOG_PAGE_SIZE;
    const lastItem = items[items.length - 1] ?? null;

    return {
      items: items.map((record) => ({
        id: record.id,
        memo: this.privateMemoEncryption.decrypt(
          record.memoCiphertext,
          record.memoKeyVersion
        ),
        createdAt: record.createdAt.toISOString(),
      })),
      nextCursor: hasNext && lastItem ? this.createCursor(lastItem) : null,
      hasNext,
    };
  }

  // 기능 : 민감정보를 제외한 구조화 이벤트 로그를 기록합니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "ProductApplicationService"
    );
  }
}
