import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoleManagementService } from './role-management.service';
import { UpdateRoleDto } from './dto/role-management.dto';
import { processRoleApprovalRequestDto } from './dto/role-management.dto';
import { messageResponse } from 'src/utils/response.utils';
import { StatusCodes } from 'http-status-codes';
import { AuthGuard } from 'src/modules/guards/auth.guard';
import { ApiSwaggerResponse } from 'src/modules/swagger/swagger.decorator';
import {
  MyRequestsResponse,
  PendingRequestsResponse,
} from './role-management.response';
import { MessageResponse } from 'src/modules/swagger/dtos/response.dtos';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from 'src/constants/messages.constants';
import { ROLE_MANAGEMENT_ROUTES } from 'src/constants/routes';
import { RolesGuard } from 'src/modules/guards/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { TransformWith } from 'src/modules/decorators/response-transformer.decorator';

@ApiTags(ROLE_MANAGEMENT_ROUTES.ROLE)
@Controller(ROLE_MANAGEMENT_ROUTES.ROLE)
@UseGuards(AuthGuard)
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  //get my requests
  @Get(ROLE_MANAGEMENT_ROUTES.MY_REQUESTS)
  @ApiSwaggerResponse(MyRequestsResponse)
  @TransformWith(MyRequestsResponse)
  @HttpCode(StatusCodes.OK)
  async getMyRequests(@Param('id') userId: string) {
    return await this.roleManagementService.getMyRequests(userId);
  }

  //request upgrade
  @Post(ROLE_MANAGEMENT_ROUTES.UPGRADE_ROLE)
  @ApiSwaggerResponse(MessageResponse, { status: StatusCodes.CREATED })
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.CREATED)
  async requestUpdgrade(
    @Body() updateRoleDto: UpdateRoleDto,
    @Param('id') userId: string,
  ) {
    if (!updateRoleDto.role) {
      throw new BadRequestException(ERROR_MESSAGES.BAD_REQUEST);
    }

    await this.roleManagementService.requestUpdgrade(
      updateRoleDto.role,
      userId,
    );

    return messageResponse(SUCCESS_MESSAGES.CREATED);
  }
  //get pending reqests
  @Get(ROLE_MANAGEMENT_ROUTES.PENDING_REQUESTS)
  @ApiSwaggerResponse(PendingRequestsResponse, {})
  @TransformWith(PendingRequestsResponse)
  @HttpCode(StatusCodes.OK)
  @UseGuards(RolesGuard())
  async getPendingRequest() {
    return await this.roleManagementService.getPendingRequest();
  }
  //approve / reject request
  @Patch(ROLE_MANAGEMENT_ROUTES.PROCESS_REQUEST)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  @UseGuards(RolesGuard())
  async processRequest(
    @Body() { isApproved }: processRoleApprovalRequestDto,
    @Param('id') roleApprovalRequestId: string,
  ) {
    await this.roleManagementService.processRequest(
      isApproved,
      roleApprovalRequestId,
    );

    return messageResponse(SUCCESS_MESSAGES.SUCCESS);
  }
}
