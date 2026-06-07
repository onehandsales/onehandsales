import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AdminQueryUseCase } from "@/modules/admin/application/use-cases/admin-query.use-case";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import {
  AdminContactListDto,
  AdminDealListDto,
  AdminDomainListDto,
  AdminUserListDto,
} from "./dto/admin-query.dto";

@UseGuards(AuthGuard, AdminGuard)
@Controller("admin/api")
export class AdminQueryController {
  constructor(private readonly adminQueryUseCase: AdminQueryUseCase) {}

  @Get("dashboard")
  getDashboard() {
    return this.adminQueryUseCase.getDashboard();
  }

  @Get("users")
  listUsers(@Query() query: AdminUserListDto) {
    return this.adminQueryUseCase.listUsers(query);
  }

  @Get("users/:userId/companies")
  listUserCompanies(
    @Param("userId") userId: string,
    @Query() query: AdminDomainListDto
  ) {
    return this.adminQueryUseCase.listCompanies(query, userId);
  }

  @Get("users/:userId/contacts")
  listUserContacts(
    @Param("userId") userId: string,
    @Query() query: AdminContactListDto
  ) {
    return this.adminQueryUseCase.listContacts(query, userId);
  }

  @Get("users/:userId/products")
  listUserProducts(
    @Param("userId") userId: string,
    @Query() query: AdminDomainListDto
  ) {
    return this.adminQueryUseCase.listProducts(query, userId);
  }

  @Get("users/:userId/deals")
  listUserDeals(
    @Param("userId") userId: string,
    @Query() query: AdminDealListDto
  ) {
    return this.adminQueryUseCase.listDeals(query, userId);
  }

  @Get("users/:userId")
  getUser(@Param("userId") userId: string) {
    return this.adminQueryUseCase.getUser(userId);
  }

  @Get("companies")
  listCompanies(@Query() query: AdminDomainListDto) {
    return this.adminQueryUseCase.listCompanies(query);
  }

  @Get("companies/:companyId")
  getCompany(@Param("companyId") companyId: string) {
    return this.adminQueryUseCase.getCompany(companyId);
  }

  @Get("contacts")
  listContacts(@Query() query: AdminContactListDto) {
    return this.adminQueryUseCase.listContacts(query);
  }

  @Get("contacts/:contactId")
  getContact(@Param("contactId") contactId: string) {
    return this.adminQueryUseCase.getContact(contactId);
  }

  @Get("products")
  listProducts(@Query() query: AdminDomainListDto) {
    return this.adminQueryUseCase.listProducts(query);
  }

  @Get("products/:productId")
  getProduct(@Param("productId") productId: string) {
    return this.adminQueryUseCase.getProduct(productId);
  }

  @Get("deals")
  listDeals(@Query() query: AdminDealListDto) {
    return this.adminQueryUseCase.listDeals(query);
  }

  @Get("deals/:dealId")
  getDeal(@Param("dealId") dealId: string) {
    return this.adminQueryUseCase.getDeal(dealId);
  }
}
