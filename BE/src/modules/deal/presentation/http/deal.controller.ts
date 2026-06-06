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
import { ChangeDealStageUseCase } from "@/modules/deal/application/use-cases/change-deal-stage.use-case";
import { CompleteDealNextActionUseCase } from "@/modules/deal/application/use-cases/complete-deal-next-action.use-case";
import { CreateDealUseCase } from "@/modules/deal/application/use-cases/create-deal.use-case";
import { CreateDealActivityUseCase } from "@/modules/deal/application/use-cases/create-deal-activity.use-case";
import { DeleteDealUseCase } from "@/modules/deal/application/use-cases/delete-deal.use-case";
import { DeleteDealActivityUseCase } from "@/modules/deal/application/use-cases/delete-deal-activity.use-case";
import { GetDealUseCase } from "@/modules/deal/application/use-cases/get-deal.use-case";
import { ListDealsUseCase } from "@/modules/deal/application/use-cases/list-deals.use-case";
import { ListDealActivitiesUseCase } from "@/modules/deal/application/use-cases/list-deal-activities.use-case";
import { RestoreDealUseCase } from "@/modules/deal/application/use-cases/restore-deal.use-case";
import { SnoozeDealNextActionUseCase } from "@/modules/deal/application/use-cases/snooze-deal-next-action.use-case";
import { UpdateDealUseCase } from "@/modules/deal/application/use-cases/update-deal.use-case";
import { UpdateDealActivityUseCase } from "@/modules/deal/application/use-cases/update-deal-activity.use-case";
import { UpdateDealNextActionUseCase } from "@/modules/deal/application/use-cases/update-deal-next-action.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { CreateDealActivityDto, UpdateDealActivityDto } from "./dto/deal-activity.dto";
import { ChangeDealStageDto, CreateDealDto, UpdateDealDto } from "./dto/deal.dto";
import {
  CompleteDealNextActionDto,
  SnoozeDealNextActionDto,
  UpdateDealNextActionDto,
} from "./dto/deal-next-action.dto";
import { ListDealActivitiesDto, ListDealsDto } from "./dto/deal-query.dto";

@UseGuards(AuthGuard)
@Controller("api/deals")
export class DealController {
  constructor(
    private readonly listDealsUseCase: ListDealsUseCase,
    private readonly createDealUseCase: CreateDealUseCase,
    private readonly getDealUseCase: GetDealUseCase,
    private readonly updateDealUseCase: UpdateDealUseCase,
    private readonly changeDealStageUseCase: ChangeDealStageUseCase,
    private readonly updateDealNextActionUseCase: UpdateDealNextActionUseCase,
    private readonly completeDealNextActionUseCase: CompleteDealNextActionUseCase,
    private readonly snoozeDealNextActionUseCase: SnoozeDealNextActionUseCase,
    private readonly deleteDealUseCase: DeleteDealUseCase,
    private readonly restoreDealUseCase: RestoreDealUseCase,
    private readonly listDealActivitiesUseCase: ListDealActivitiesUseCase,
    private readonly createDealActivityUseCase: CreateDealActivityUseCase,
    private readonly updateDealActivityUseCase: UpdateDealActivityUseCase,
    private readonly deleteDealActivityUseCase: DeleteDealActivityUseCase
  ) {}

  @Get()
  listDeals(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListDealsDto
  ) {
    return this.listDealsUseCase.execute(currentUser, query);
  }

  @Post()
  createDeal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateDealDto
  ) {
    return this.createDealUseCase.execute(currentUser, body);
  }

  @Get(":dealId")
  getDeal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string
  ) {
    return this.getDealUseCase.execute(currentUser, dealId);
  }

  @Patch(":dealId")
  updateDeal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string,
    @Body() body: UpdateDealDto
  ) {
    return this.updateDealUseCase.execute(currentUser, dealId, body);
  }

  @Patch(":dealId/stage")
  changeStage(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string,
    @Body() body: ChangeDealStageDto
  ) {
    return this.changeDealStageUseCase.execute(currentUser, dealId, body);
  }

  @Patch(":dealId/next-action")
  updateNextAction(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string,
    @Body() body: UpdateDealNextActionDto
  ) {
    return this.updateDealNextActionUseCase.execute(currentUser, dealId, body);
  }

  @Post(":dealId/next-action/complete")
  completeNextAction(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string,
    @Body() body: CompleteDealNextActionDto
  ) {
    return this.completeDealNextActionUseCase.execute(currentUser, dealId, body);
  }

  @Post(":dealId/next-action/snooze")
  snoozeNextAction(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string,
    @Body() body: SnoozeDealNextActionDto
  ) {
    return this.snoozeDealNextActionUseCase.execute(currentUser, dealId, body);
  }

  @Delete(":dealId")
  deleteDeal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string
  ) {
    return this.deleteDealUseCase.execute(currentUser, dealId);
  }

  @Post(":dealId/restore")
  restoreDeal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string
  ) {
    return this.restoreDealUseCase.execute(currentUser, dealId);
  }

  @Get(":dealId/activities")
  listActivities(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string,
    @Query() query: ListDealActivitiesDto
  ) {
    return this.listDealActivitiesUseCase.execute(currentUser, dealId, query);
  }

  @Post(":dealId/activities")
  createActivity(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string,
    @Body() body: CreateDealActivityDto
  ) {
    return this.createDealActivityUseCase.execute(currentUser, dealId, body);
  }

  @Patch(":dealId/activities/:activityId")
  updateActivity(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string,
    @Param("activityId") activityId: string,
    @Body() body: UpdateDealActivityDto
  ) {
    return this.updateDealActivityUseCase.execute(
      currentUser,
      dealId,
      activityId,
      body
    );
  }

  @Delete(":dealId/activities/:activityId")
  deleteActivity(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("dealId") dealId: string,
    @Param("activityId") activityId: string
  ) {
    return this.deleteDealActivityUseCase.execute(
      currentUser,
      dealId,
      activityId
    );
  }
}
