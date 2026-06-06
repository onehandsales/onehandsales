import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CreateCompanyUseCase } from "@/modules/company/application/use-cases/create-company.use-case";
import { CreateCompanyLogUseCase } from "@/modules/company/application/use-cases/create-company-log.use-case";
import { DeleteCompanyUseCase } from "@/modules/company/application/use-cases/delete-company.use-case";
import { DeleteCompanyLogUseCase } from "@/modules/company/application/use-cases/delete-company-log.use-case";
import { GetCompanyUseCase } from "@/modules/company/application/use-cases/get-company.use-case";
import { ListCompaniesUseCase } from "@/modules/company/application/use-cases/list-companies.use-case";
import { ListCompanyLogsUseCase } from "@/modules/company/application/use-cases/list-company-logs.use-case";
import { RestoreCompanyUseCase } from "@/modules/company/application/use-cases/restore-company.use-case";
import { UpdateCompanyUseCase } from "@/modules/company/application/use-cases/update-company.use-case";
import { UpdateCompanyLogUseCase } from "@/modules/company/application/use-cases/update-company-log.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateCompanyDto, UpdateCompanyDto } from "./dto/company.dto";
import { CreateCompanyLogDto, UpdateCompanyLogDto } from "./dto/company-log.dto";
import { ListCompaniesDto, ListCompanyLogsDto } from "./dto/company-query.dto";

@UseGuards(AuthGuard)
@Controller("api/companies")
export class CompanyController {
  constructor(
    private readonly listCompaniesUseCase: ListCompaniesUseCase,
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
    private readonly restoreCompanyUseCase: RestoreCompanyUseCase,
    private readonly listCompanyLogsUseCase: ListCompanyLogsUseCase,
    private readonly createCompanyLogUseCase: CreateCompanyLogUseCase,
    private readonly updateCompanyLogUseCase: UpdateCompanyLogUseCase,
    private readonly deleteCompanyLogUseCase: DeleteCompanyLogUseCase
  ) {}

  @Get()
  listCompanies(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListCompaniesDto
  ) {
    return this.listCompaniesUseCase.execute(currentUser, query);
  }

  @Post()
  createCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateCompanyDto
  ) {
    return this.createCompanyUseCase.execute(currentUser, body);
  }

  @Get(":companyId")
  getCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId") companyId: string
  ) {
    return this.getCompanyUseCase.execute(currentUser, companyId);
  }

  @Patch(":companyId")
  updateCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId") companyId: string,
    @Body() body: UpdateCompanyDto
  ) {
    return this.updateCompanyUseCase.execute(currentUser, companyId, body);
  }

  @Delete(":companyId")
  deleteCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId") companyId: string
  ) {
    return this.deleteCompanyUseCase.execute(currentUser, companyId);
  }

  @Post(":companyId/restore")
  restoreCompany(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId") companyId: string
  ) {
    return this.restoreCompanyUseCase.execute(currentUser, companyId);
  }

  @Get(":companyId/logs")
  listCompanyLogs(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId") companyId: string,
    @Query() query: ListCompanyLogsDto
  ) {
    return this.listCompanyLogsUseCase.execute(currentUser, companyId, query);
  }

  @Post(":companyId/logs")
  createCompanyLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId") companyId: string,
    @Body() body: CreateCompanyLogDto
  ) {
    return this.createCompanyLogUseCase.execute(currentUser, companyId, {
      loggedAt: new Date(body.loggedAt),
      title: body.title,
      content: body.content,
    });
  }

  @Patch(":companyId/logs/:logId")
  updateCompanyLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId") companyId: string,
    @Param("logId") logId: string,
    @Body() body: UpdateCompanyLogDto
  ) {
    return this.updateCompanyLogUseCase.execute(currentUser, companyId, logId, {
      ...(body.loggedAt !== undefined
        ? { loggedAt: new Date(body.loggedAt) }
        : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
    });
  }

  @Delete(":companyId/logs/:logId")
  deleteCompanyLog(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("companyId") companyId: string,
    @Param("logId") logId: string
  ) {
    return this.deleteCompanyLogUseCase.execute(currentUser, companyId, logId);
  }
}

