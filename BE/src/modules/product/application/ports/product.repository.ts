export const PRODUCT_REPOSITORY = Symbol("PRODUCT_REPOSITORY");

// 역할 : ProductLookupRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductLookupRecord {
  readonly id: string;
  readonly userId: string;
}

// 역할 : ProductCategoryRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductCategoryRecord {
  readonly id: string;
  readonly categoryName: string;
}

// 역할 : ProductStatusRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductStatusRecord {
  readonly id: string;
  readonly statusName: string;
}

// 역할 : ProductRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductRecord {
  readonly id: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategory: ProductCategoryRecord;
  readonly productStatus: ProductStatusRecord;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : ProductListRecord 목록에서만 필요한 집계 값을 포함한 제품 레코드를 정의합니다.
export interface ProductListRecord extends ProductRecord {
  readonly dealCount: number;
}

// 역할 : ProductPageRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductPageRecord {
  readonly items: ProductListRecord[];
  readonly totalCount: number;
}

// 역할 : ProductListSort 제품 목록 정렬 기준을 정의합니다.
export enum ProductListSort {
  CREATED_AT_DESC = "createdAtDesc",
  DEAL_COUNT_DESC = "dealCountDesc",
  DEAL_COUNT_ASC = "dealCountAsc",
}

// 역할 : ListProductsInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ListProductsInput {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly productName?: string;
  readonly productCategoryId?: string;
  readonly productCategoryIds?: readonly string[];
  readonly productStatusId?: string;
  readonly productStatusIds?: readonly string[];
  readonly sort?: ProductListSort;
}

// 역할 : ExportProductsInput 제품 export 조회 조건을 정의합니다.
export interface ExportProductsInput {
  readonly userId: string;
  readonly productName?: string;
  readonly productCategoryId?: string;
  readonly productCategoryIds?: readonly string[];
  readonly productStatusId?: string;
  readonly productStatusIds?: readonly string[];
  readonly sort?: ProductListSort;
}

// 역할 : ProductDealRecord 제품에 연결된 딜 목록 레코드를 정의합니다.
export interface ProductDealRecord {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: string;
  readonly createdAt: Date;
}

// 역할 : ListProductDealsInput 제품에 연결된 딜 조회 조건을 정의합니다.
export interface ListProductDealsInput {
  readonly userId: string;
  readonly productId: string;
}

// 역할 : CreateProductInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateProductInput {
  readonly userId: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategoryId: string;
  readonly productStatusId: string;
}

// 역할 : UpdateProductInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateProductInput {
  readonly productName?: string;
  readonly productPrice?: number;
  readonly productCategoryId?: string;
  readonly productStatusId?: string;
}

// 역할 : CreateProductMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateProductMemoLogInput {
  readonly productId: string;
  readonly userId: string;
  readonly memoType: string;
  readonly memo: string;
}

// 역할 : MemoLogCursor 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface MemoLogCursor {
  readonly createdAt: Date;
  readonly id: string;
}

// 역할 : ProductMemoLogRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductMemoLogRecord {
  readonly id: string;
  readonly memoType: string;
  readonly memo: string;
  readonly createdAt: Date;
}

// 역할 : UpdateProductMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateProductMemoLogInput {
  readonly userId: string;
  readonly productId: string;
  readonly memoLogId: string;
  readonly memoType?: string;
  readonly memo?: string;
}

// 역할 : ProductPrivateMemoLogRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ProductPrivateMemoLogRecord {
  readonly id: string;
  readonly memoCiphertext: string;
  readonly memoKeyVersion: string;
  readonly createdAt: Date;
}

// 역할 : CreateProductPrivateMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateProductPrivateMemoLogInput {
  readonly productId: string;
  readonly userId: string;
  readonly memoCiphertext: string;
  readonly memoKeyVersion: string;
}

// 역할 : DeleteProductMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DeleteProductMemoLogInput {
  readonly userId: string;
  readonly productId: string;
  readonly memoLogId: string;
  readonly deletedAt: Date;
  readonly deletedByUserId: string;
  readonly trashExpiresAt: Date;
}

// 역할 : DeleteProductPrivateMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface DeleteProductPrivateMemoLogInput {
  readonly userId: string;
  readonly productId: string;
  readonly privateMemoLogId: string;
  readonly deletedAt: Date;
  readonly deletedByUserId: string;
  readonly trashExpiresAt: Date;
}

// 역할 : ProductRepository 저장소가 제공해야 하는 영속성 계약을 정의합니다.
export interface ProductRepository {
  // 기능 : 제품 저장소 작업을 트랜잭션 경계 안에서 실행합니다.
  runInTransaction<T>(
    work: (repository: ProductRepository) => Promise<T>
  ): Promise<T>;
  // 기능 : 현재 사용자의 제품 목록과 전체 개수를 조회합니다.
  listProducts(input: ListProductsInput): Promise<ProductPageRecord>;
  // 기능 : 현재 사용자의 제품 export 대상 전체 목록을 조회합니다.
  listProductsForExport(input: ExportProductsInput): Promise<ProductListRecord[]>;
  // 기능 : 현재 사용자의 제품에 연결된 딜 전체 목록을 조회합니다.
  listProductDeals(input: ListProductDealsInput): Promise<ProductDealRecord[]>;
  // 기능 : 현재 사용자의 제품 단건을 조회합니다.
  findProduct(userId: string, productId: string): Promise<ProductRecord | null>;
  // 기능 : 현재 사용자의 제품 존재 여부만 조회합니다.
  findProductLookup(
    userId: string,
    productId: string
  ): Promise<ProductLookupRecord | null>;
  // 기능 : 현재 사용자의 제품 단건을 생성합니다.
  createProduct(input: CreateProductInput): Promise<ProductLookupRecord>;
  // 기능 : 현재 사용자의 제품 기본 정보를 수정합니다.
  updateProduct(
    userId: string,
    productId: string,
    input: UpdateProductInput
  ): Promise<boolean>;
  // 기능 : 현재 사용자의 제품 카테고리 목록을 조회합니다.
  listCategories(userId: string): Promise<ProductCategoryRecord[]>;
  // 기능 : 현재 사용자의 제품 카테고리 단건을 조회합니다.
  findCategory(
    userId: string,
    categoryId: string
  ): Promise<ProductCategoryRecord | null>;
  // 기능 : 현재 사용자 안에서 같은 제품 카테고리 이름이 있는지 확인합니다.
  existsCategoryByName(userId: string, categoryName: string): Promise<boolean>;
  // 기능 : 현재 사용자의 제품 카테고리를 생성합니다.
  createCategory(userId: string, categoryName: string): Promise<void>;
  // 기능 : 제품 카테고리를 사용하는 제품이 있는지 확인합니다.
  isCategoryInUse(userId: string, categoryId: string): Promise<boolean>;
  // 기능 : 현재 사용자의 제품 카테고리를 삭제합니다.
  deleteCategory(userId: string, categoryId: string): Promise<void>;
  // 기능 : 현재 사용자의 제품 상태 목록을 조회합니다.
  listStatuses(userId: string): Promise<ProductStatusRecord[]>;
  // 기능 : 현재 사용자의 제품 상태 단건을 조회합니다.
  findStatus(userId: string, statusId: string): Promise<ProductStatusRecord | null>;
  // 기능 : 현재 사용자 안에서 같은 제품 상태 이름이 있는지 확인합니다.
  existsStatusByName(userId: string, statusName: string): Promise<boolean>;
  // 기능 : 현재 사용자의 제품 상태를 생성합니다.
  createStatus(userId: string, statusName: string): Promise<void>;
  // 기능 : 제품 상태를 사용하는 제품이 있는지 확인합니다.
  isStatusInUse(userId: string, statusId: string): Promise<boolean>;
  // 기능 : 현재 사용자의 제품 상태를 삭제합니다.
  deleteStatus(userId: string, statusId: string): Promise<void>;
  // 기능 : 제품 일반 메모 로그를 생성합니다.
  createMemoLog(input: CreateProductMemoLogInput): Promise<void>;
  // 기능 : 제품 일반 메모 로그를 cursor 기준으로 조회합니다.
  listMemoLogs(input: {
    readonly userId: string;
    readonly productId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<ProductMemoLogRecord[]>;
  // 기능 : 제품 일반 메모 로그의 memoType 또는 memo를 수정합니다.
  updateMemoLog(input: UpdateProductMemoLogInput): Promise<boolean>;
  // 기능 : 제품 일반 메모 로그를 휴지통 상태로 전환합니다.
  deleteMemoLog(input: DeleteProductMemoLogInput): Promise<boolean>;
  // 기능 : 제품 개인 비밀 메모 로그를 생성합니다.
  createPrivateMemoLog(input: CreateProductPrivateMemoLogInput): Promise<void>;
  // 기능 : 제품 개인 비밀 메모 로그를 작성자 본인 기준으로 조회합니다.
  listPrivateMemoLogs(input: {
    readonly userId: string;
    readonly productId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<ProductPrivateMemoLogRecord[]>;
  // 기능 : 제품 개인 비밀 메모 로그의 암호문과 key version만 수정합니다.
  updatePrivateMemoLog(input: {
    readonly userId: string;
    readonly productId: string;
    readonly privateMemoLogId: string;
    readonly memoCiphertext: string;
    readonly memoKeyVersion: string;
  }): Promise<boolean>;
  // 기능 : 제품 개인 비밀 메모 로그를 휴지통 상태로 전환합니다.
  deletePrivateMemoLog(
    input: DeleteProductPrivateMemoLogInput
  ): Promise<boolean>;
}
