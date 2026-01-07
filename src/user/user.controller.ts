import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import responseUtils from 'src/utils/response.utils';
import type { Response } from 'express';
import { ApiSwaggerResponse } from 'src/modules/swagger/swagger.decorator';
import { FindAllUsersResponse, UserResponse } from './user.response';
import { AuthGuard } from 'src/modules/guards/auth.guard';
import { MessageResponse } from 'src/modules/swagger/dtos/response.dtos';
import { updateUserParams } from '../../dist/user/user.types';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiSwaggerResponse(FindAllUsersResponse)
  @Get()
  async findAll(
    @Res() res: Response,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '1',
  ) {
    try {
      const result = await this.userService.findAll(+page, +limit);
      return responseUtils.success(res, {
        data: result,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @ApiSwaggerResponse(UserResponse)
  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this.userService.findOne(id);
      return responseUtils.success(res, {
        data: result,
        transformWith: UserResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @ApiSwaggerResponse(MessageResponse)
  @Patch(':id')
  update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateUserParams: UpdateUserDto,
  ) {
    try {
      this.userService.update(id, updateUserParams);
      responseUtils.success(res, {
        data: {
          message: 'User updated successfully!',
        },
        transformWith: MessageResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @ApiSwaggerResponse(MessageResponse)
  @Delete(':id')
  remove(@Res() res: Response, @Param('id') id: string) {
    try {
      this.userService.remove(id);
      return responseUtils.success(res, {
        data: {
          message: 'User deleted successfully!',
        },
        transformWith: MessageResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }
}
