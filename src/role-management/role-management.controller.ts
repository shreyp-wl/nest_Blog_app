import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { RoleManagementService } from './role-management.service';
import type { Response } from 'express';
import { UpdateRoleDto } from './dto/upgrade-role.dto';
import { processRoleApprovalRequestDto } from './dto/process-role.dto';

@Controller('role')
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  //get my requests
  @Get(':id/my-requests')
  async getMyRequests(@Res() res: Response, @Param('id') userId: string) {
    try {
      const result = await this.roleManagementService.getMyRequests(userId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  //request upgrade
  @Post(':id/upgrade')
  async requestUpdgrade(
    @Res() res: Response,
    @Body() updateRoleDto: UpdateRoleDto,
    @Param('id') userId: string,
  ) {
    if (!updateRoleDto.role) {
      throw new BadRequestException('Role is not specified!');
    }

    try {
      await this.roleManagementService.requestUpdgrade(
        updateRoleDto.role,
        userId,
      );

      return res.status(201).json({
        success: true,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
  //get pending reqests
  @Get('pending-requests')
  async getPendingRequest(@Res() res: Response) {
    try {
      const result = await this.roleManagementService.getPendingRequest();
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
  //approve / reject request
  @Patch('/:id/process-request')
  async processRequest(
    @Res() res: Response,
    @Body() processRoleApprovalRequestDto: processRoleApprovalRequestDto,
    @Param('id') roleApprovalRequestId: string,
  ) {
    try {
      await this.roleManagementService.processRequest(
        processRoleApprovalRequestDto.isApproved,
        roleApprovalRequestId,
      );

      return res.status(200).json({
        success: true,
        message: 'Role updation requst has been processed',
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
}
