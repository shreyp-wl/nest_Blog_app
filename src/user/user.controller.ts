import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { ApiSwaggerResponse } from 'src/modules/swagger/swagger.decorator';
import { FindAllUsersResponse, UserResponse } from './user.response';
import { AuthGuard } from 'src/modules/guards/auth.guard';
import { MessageResponse } from 'src/modules/swagger/dtos/response.dtos';
import { SUCCESS_MESSAGES } from 'src/constants/messages.constants';
import { messageResponse } from 'src/utils/response.utils';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { USER_ROUTES } from 'src/constants/routes';
import { RolesGuard } from 'src/modules/guards/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { USER_ROLES } from './user-types';
import { CurrentUser } from 'src/modules/decorators/get-current-user.decorator';
import { type TokenPayload } from 'src/auth/auth-types';
import { TransformWith } from 'src/modules/decorators/response-transformer.decorator';
import { StatusCodes } from 'http-status-codes';

@ApiTags(USER_ROUTES.USER)
@Controller(USER_ROUTES.USER)
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(USER_ROUTES.FIND_ALL)
  @ApiSwaggerResponse(FindAllUsersResponse)
  @TransformWith(FindAllUsersResponse)
  @HttpCode(StatusCodes.OK)
  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.ADMIN))
  async findAll(@Query() { page, limit, isPagination }: PaginationDto) {
    return await this.userService.findAll({
      page,
      limit,
      isPagination,
    });
  }

  @Get(USER_ROUTES.FIND_ONE)
  @ApiSwaggerResponse(UserResponse)
  @TransformWith(UserResponse)
  @HttpCode(StatusCodes.OK)
  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.ADMIN))
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Patch(USER_ROUTES.UPDATE)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  @UseGuards(AuthGuard)
  update(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() updateUserParams: UpdateUserDto,
  ) {
    this.userService.update(user.id, id, updateUserParams);
    return messageResponse(SUCCESS_MESSAGES.SUCCESS);
  }

  @Delete(USER_ROUTES.DELETE)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.ADMIN))
  remove(@Param('id') id: string) {
    this.userService.remove(id);
    return messageResponse(SUCCESS_MESSAGES.SUCCESS);
  }
}
