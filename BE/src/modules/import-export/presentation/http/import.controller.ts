import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ConfirmImportJobUseCase } from "@/modules/import-export/application/use-cases/confirm-import-job.use-case";
import { CreateImportJobUseCase } from "@/modules/import-export/application/use-cases/create-import-job.use-case";
import { GenerateImportMappingUseCase } from "@/modules/import-export/application/use-cases/generate-import-mapping.use-case";
import { GetImportJobUseCase } from "@/modules/import-export/application/use-cases/get-import-job.use-case";
import {
  IMPORT_MAX_FILE_SIZE_BYTES,
  type UploadedImportFile,
} from "@/modules/import-export/application/use-cases/import-input";
import { UpdateImportMappingUseCase } from "@/modules/import-export/application/use-cases/update-import-mapping.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  ConfirmImportJobDto,
  CreateImportJobDto,
  UpdateImportMappingDto,
} from "./dto/import.dto";

@UseGuards(AuthGuard)
@Controller("api/imports")
export class ImportController {
  constructor(
    private readonly createImportJobUseCase: CreateImportJobUseCase,
    private readonly generateImportMappingUseCase: GenerateImportMappingUseCase,
    private readonly updateImportMappingUseCase: UpdateImportMappingUseCase,
    private readonly confirmImportJobUseCase: ConfirmImportJobUseCase,
    private readonly getImportJobUseCase: GetImportJobUseCase
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: IMPORT_MAX_FILE_SIZE_BYTES },
    })
  )
  createImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @UploadedFile() file: UploadedImportFile | undefined,
    @Body() body: CreateImportJobDto
  ) {
    return this.createImportJobUseCase.execute(currentUser, {
      targetType: body.targetType,
      file,
    });
  }

  @Post(":importJobId/map")
  generateImportMapping(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId") importJobId: string
  ) {
    return this.generateImportMappingUseCase.execute(currentUser, importJobId);
  }

  @Patch(":importJobId/mapping")
  updateImportMapping(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId") importJobId: string,
    @Body() body: UpdateImportMappingDto
  ) {
    return this.updateImportMappingUseCase.execute(currentUser, importJobId, {
      mapping: body.mapping,
    });
  }

  @Post(":importJobId/confirm")
  confirmImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId") importJobId: string,
    @Body() body: ConfirmImportJobDto
  ) {
    return this.confirmImportJobUseCase.execute(currentUser, importJobId, body);
  }

  @Get(":importJobId")
  getImportJob(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("importJobId") importJobId: string
  ) {
    return this.getImportJobUseCase.execute(currentUser, importJobId);
  }
}
