import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { ProductApplicationService } from "@/modules/product/application/services/product-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { createXlsxDownloadResponse } from "@/shared/presentation/http/download-file-response";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateProductCategoryDto,
  CreateProductDto,
  CreateProductMemoLogDto,
  CreateProductPrivateMemoLogDto,
  CreateProductStatusDto,
  CursorQueryDto,
  ExportProductsQueryDto,
  ListProductsQueryDto,
  UpdateProductDto,
  UpdateProductMemoLogDto,
  UpdateProductPrivateMemoLogDto,
} from "./dto/product-request.dto";

// 역할 : ProductController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/products")
export class ProductController {
  // 기능 : 제품 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly productApplicationService: ProductApplicationService
  ) {}

  // API : 제품, 제품 목록 조회
  @Get()
  listProducts(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListProductsQueryDto
  ) {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달한다.
    return this.productApplicationService.listProducts(currentUser, query);
  }

  // API : 제품, 검색과 필터가 반영된 제품 목록 xlsx 내보내기
  @Get("export/xlsx")
  async exportProductsXlsx(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ExportProductsQueryDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    // 1. query 조건과 현재 사용자를 application 계층으로 전달해 xlsx 파일을 생성한다.
    const file = await this.productApplicationService.exportProductsXlsx(
      currentUser,
      query
    );

    // 2. 생성된 xlsx 파일 정보를 HTTP 다운로드 응답으로 변환한다.
    return createXlsxDownloadResponse(response, file);
  }

  // API : 제품, 제품에 연결된 딜 전체 목록 조회
  @Get(":productId/deals")
  listProductDeals(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string
  ) {
    // 1. path param의 제품 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.productApplicationService.listProductDeals(
      currentUser,
      productId
    );
  }

  // API : 제품, 제품 단건 조회
  @Get(":productId")
  getProduct(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string
  ) {
    // 1. path param의 제품 ID와 현재 사용자를 application 계층으로 전달한다.
    return this.productApplicationService.getProduct(currentUser, productId);
  }

  // API : 제품, 제품 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateProductDto
  ): Promise<void> {
    // 1. request body와 현재 사용자를 application 계층으로 전달한다.
    await this.productApplicationService.createProduct(currentUser, body);
  }

  // API : 제품, 제품 기본 정보 수정
  @Patch(":productId")
  @HttpCode(HttpStatus.CREATED)
  async updateProduct(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Body() body: UpdateProductDto
  ): Promise<void> {
    // 1. path param, request body, 현재 사용자를 application 계층으로 전달한다.
    await this.productApplicationService.updateProduct(
      currentUser,
      productId,
      body
    );
  }

  // API : 제품, 제품 삭제
  @Delete(":productId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string
  ): Promise<void> {
    // 1. path param의 제품 ID와 현재 사용자를 application 계층으로 전달한다.
    await this.productApplicationService.deleteProduct(currentUser, productId);
  }

  // API : 제품 메모, 일반 메모 로그 생성
  @Post(":productId/memo-logs")
  @HttpCode(HttpStatus.CREATED)
  async createMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Body() body: CreateProductMemoLogDto
  ): Promise<void> {
    // 1. 제품 ID와 메모 생성 요청을 application 계층으로 전달한다.
    await this.productApplicationService.createMemoLog(
      currentUser,
      productId,
      body
    );
  }

  // API : 제품 메모, 일반 메모 로그 목록 조회
  @Get(":productId/memo-logs")
  listMemoLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Query() query: CursorQueryDto
  ) {
    // 1. 제품 ID와 cursor 조건을 application 계층으로 전달한다.
    return this.productApplicationService.listMemoLogs(
      currentUser,
      productId,
      query
    );
  }

  // API : 제품 메모, 일반 메모 로그 수정
  @Patch(":productId/memo-logs/:memoLogId")
  @HttpCode(HttpStatus.CREATED)
  async updateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Param("memoLogId", ParseUUIDPipe) memoLogId: string,
    @Body() body: UpdateProductMemoLogDto
  ): Promise<void> {
    // 1. 제품 ID, 메모 로그 ID, 수정 본문을 application 계층으로 전달한다.
    await this.productApplicationService.updateMemoLog(
      currentUser,
      productId,
      memoLogId,
      body
    );
  }

  // API : 제품 메모, 일반 메모 로그 삭제
  @Delete(":productId/memo-logs/:memoLogId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Param("memoLogId", ParseUUIDPipe) memoLogId: string
  ): Promise<void> {
    // 1. 제품 ID, 메모 로그 ID를 application 계층으로 전달한다.
    await this.productApplicationService.deleteMemoLog(
      currentUser,
      productId,
      memoLogId
    );
  }

  // API : 제품 비밀 메모, 개인 비밀 메모 로그 생성
  @Post(":productId/private-memo-logs")
  @HttpCode(HttpStatus.CREATED)
  async createPrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Body() body: CreateProductPrivateMemoLogDto
  ): Promise<void> {
    // 1. 제품 ID와 비밀 메모 본문을 application 계층으로 전달한다.
    await this.productApplicationService.createPrivateMemoLog(
      currentUser,
      productId,
      body.memo
    );
  }

  // API : 제품 비밀 메모, 개인 비밀 메모 로그 목록 조회
  @Get(":productId/private-memo-logs")
  listPrivateMemoLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Query() query: CursorQueryDto
  ) {
    // 1. 제품 ID와 cursor 조건을 application 계층으로 전달한다.
    return this.productApplicationService.listPrivateMemoLogs(
      currentUser,
      productId,
      query
    );
  }

  // API : 제품 비밀 메모, 개인 비밀 메모 로그 수정
  @Patch(":productId/private-memo-logs/:privateMemoLogId")
  @HttpCode(HttpStatus.CREATED)
  async updatePrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Param("privateMemoLogId", ParseUUIDPipe) privateMemoLogId: string,
    @Body() body: UpdateProductPrivateMemoLogDto
  ): Promise<void> {
    // 1. 제품 ID, 비밀 메모 로그 ID, 수정 본문을 application 계층으로 전달한다.
    await this.productApplicationService.updatePrivateMemoLog(
      currentUser,
      productId,
      privateMemoLogId,
      body.memo
    );
  }

  // API : 제품 비밀 메모, 개인 비밀 메모 로그 삭제
  @Delete(":productId/private-memo-logs/:privateMemoLogId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePrivateMemoLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("productId", ParseUUIDPipe) productId: string,
    @Param("privateMemoLogId", ParseUUIDPipe) privateMemoLogId: string
  ): Promise<void> {
    // 1. 제품 ID, 비밀 메모 로그 ID를 application 계층으로 전달한다.
    await this.productApplicationService.deletePrivateMemoLog(
      currentUser,
      productId,
      privateMemoLogId
    );
  }
}

// 역할 : ProductCategoryController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/product-categories")
export class ProductCategoryController {
  // 기능 : 제품 카테고리 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly productApplicationService: ProductApplicationService
  ) {}

  // API : 제품 카테고리, 카테고리 목록 조회
  @Get()
  listCategories(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 제품 카테고리 조회를 application 계층으로 위임한다.
    return this.productApplicationService.listCategories(currentUser);
  }

  // API : 제품 카테고리, 카테고리 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateProductCategoryDto
  ): Promise<void> {
    // 1. request body의 카테고리명을 application 계층으로 전달한다.
    await this.productApplicationService.createCategory(
      currentUser,
      body.categoryName
    );
  }

  // API : 제품 카테고리, 카테고리 삭제
  @Delete(":categoryId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("categoryId", ParseUUIDPipe) categoryId: string
  ): Promise<void> {
    // 1. 삭제할 카테고리 ID와 현재 사용자를 application 계층으로 전달한다.
    await this.productApplicationService.deleteCategory(currentUser, categoryId);
  }
}

// 역할 : ProductStatusController HTTP API 요청을 받아 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/product-statuses")
export class ProductStatusController {
  // 기능 : 제품 상태 API 처리에 필요한 application service를 주입받습니다.
  constructor(
    private readonly productApplicationService: ProductApplicationService
  ) {}

  // API : 제품 상태, 상태 목록 조회
  @Get()
  listStatuses(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자의 제품 상태 조회를 application 계층으로 위임한다.
    return this.productApplicationService.listStatuses(currentUser);
  }

  // API : 제품 상태, 상태 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStatus(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateProductStatusDto
  ): Promise<void> {
    // 1. request body의 상태명을 application 계층으로 전달한다.
    await this.productApplicationService.createStatus(
      currentUser,
      body.statusName
    );
  }

  // API : 제품 상태, 상태 삭제
  @Delete(":statusId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStatus(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("statusId", ParseUUIDPipe) statusId: string
  ): Promise<void> {
    // 1. 삭제할 상태 ID와 현재 사용자를 application 계층으로 전달한다.
    await this.productApplicationService.deleteStatus(currentUser, statusId);
  }
}
