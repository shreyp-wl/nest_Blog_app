import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from './dto/comment.dto';
import { COMMENT_ROUTES } from 'src/constants/routes';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { messageResponse } from 'src/utils/response.utils';
import { SUCCESS_MESSAGES } from 'src/constants/messages.constants';
import { MessageResponse } from 'src/modules/swagger/dtos/response.dtos';
import { ApiSwaggerResponse } from 'src/modules/swagger/swagger.decorator';
import { CommentResponse, GetAllCommentResponse } from './comment.response';
import { CurrentUser } from 'src/modules/decorators/get-current-user.decorator';
import { type TokenPayload } from 'src/auth/auth-types';
import { AuthGuard } from 'src/modules/guards/auth.guard';
import { TransformWith } from 'src/modules/decorators/response-transformer.decorator';
import { StatusCodes } from 'http-status-codes';

@ApiTags(COMMENT_ROUTES.COMMENT)
@Controller(COMMENT_ROUTES.COMMENT)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(COMMENT_ROUTES.GET_ALL)
  @ApiSwaggerResponse(GetAllCommentResponse)
  @TransformWith(GetAllCommentResponse)
  @HttpCode(StatusCodes.OK)
  async findAll(@Param() { page, limit, isPagination }: PaginationDto) {
    return await this.commentsService.findAll({
      page,
      limit,
      isPagination,
    });
  }

  @Get(COMMENT_ROUTES.GET_ONE)
  @ApiSwaggerResponse(CommentResponse)
  @TransformWith(CommentResponse)
  @HttpCode(StatusCodes.OK)
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(id);
  }

  @Patch(COMMENT_ROUTES.UPDATE)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  @UseGuards(AuthGuard)
  async update(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    await this.commentsService.update(user.id, id, updateCommentDto);
    return messageResponse(SUCCESS_MESSAGES.UPDATED);
  }

  @Delete(COMMENT_ROUTES.DELETE)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  async remove(@Param('id') id: string) {
    await this.commentsService.remove(id);
    return messageResponse(SUCCESS_MESSAGES.SUCCESS);
  }
}
