// BE API response shapes — fields match what the BE actually returns

export type ProductCategory = {
  readonly id: string;
  readonly categoryName: string;
};

export type ProductStatus = {
  readonly id: string;
  readonly statusName: string;
};

// List item returned by GET /api/products
export type Product = {
  readonly id: string;
  readonly productName: string;
  readonly productCategory: ProductCategory;
  readonly productStatus: ProductStatus;
  readonly dealCount: number;
  readonly createdAt: string;
};

// Detail returned by GET /api/products/:id
export type ProductDetail = {
  readonly id: string;
  readonly productName: string;
  readonly productCategory: ProductCategory;
  readonly productStatus: ProductStatus;
  readonly productPrice: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProductListResponse = {
  readonly items: Product[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
};

export type ProductCategoryListResponse = {
  readonly items: ProductCategory[];
};

export type ProductStatusListResponse = {
  readonly items: ProductStatus[];
};

export type ProductListParams = {
  readonly page?: number;
  readonly productName?: string;
  readonly productCategoryId?: string;
  readonly productStatusId?: string;
  readonly sort?: ProductSort;
};

export type ProductSort = "createdAtDesc" | "dealCountDesc" | "dealCountAsc";

export type CreateProductInput = {
  readonly productName: string;
  readonly productPrice: number;
  readonly productCategoryId: string;
  readonly productStatusId: string;
  readonly productMemo?: string;
};

export type UpdateProductInput = {
  readonly productId: string;
  readonly productName?: string;
  readonly productPrice?: number;
  readonly productCategoryId?: string;
  readonly productStatusId?: string;
};

export type CreateProductCategoryInput = {
  readonly categoryName: string;
};

export type CreateProductStatusInput = {
  readonly statusName: string;
};

// Connection types (kept for schema compatibility)
export type ProductConnectionTargetType = "COMPANY" | "CONTACT" | "DEAL";

export type ProductConnectionType =
  | "INTERESTED"
  | "DELIVERED"
  | "PROPOSED"
  | "COMPETITOR"
  | "MAINTENANCE"
  | "OTHER";

export type ProductConnection = {
  readonly id: string;
  readonly productId: string;
  readonly targetType: ProductConnectionTargetType;
  readonly targetId: string;
  readonly targetName: string;
  readonly connectionType: ProductConnectionType;
  readonly note: string | null;
  readonly createdAt: string;
};

export type ProductLog = {
  readonly id: string;
  readonly productId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateProductConnectionInput = {
  readonly productId: string;
  readonly targetType: ProductConnectionTargetType;
  readonly targetId: string;
  readonly connectionType: ProductConnectionType;
  readonly note?: string;
};

export type CreateProductLogInput = {
  readonly productId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content?: string;
};

export type UpdateProductLogInput = {
  readonly productId: string;
  readonly logId: string;
  readonly loggedAt?: string;
  readonly title?: string;
  readonly content?: string;
};

// Memo log shapes (for detail screen)
export type ProductMemoLog = {
  readonly id: string;
  readonly memoType: string;
  readonly memo: string;
  readonly createdAt: string;
};

export type ProductPrivateMemoLog = {
  readonly id: string;
  readonly memo: string;
  readonly createdAt: string;
};

export type ProductMemoLogListResponse = {
  readonly items: ProductMemoLog[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
};

export type ProductPrivateMemoLogListResponse = {
  readonly items: ProductPrivateMemoLog[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
};

export type ProductDeal = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly dealStatus: string;
  readonly createdAt: string;
};

export type ProductDealListResponse = {
  readonly items: ProductDeal[];
};
