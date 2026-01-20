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
import { BlogpostService } from './blogpost.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blogpost.dto';
import { SUCCESS_MESSAGES } from 'src/constants/messages.constants';
import { ApiSwaggerResponse } from 'src/modules/swagger/swagger.decorator';
import { MessageResponse } from 'src/modules/swagger/dtos/response.dtos';
import { StatusCodes } from 'http-status-codes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  GetAllBlogPostResponse,
  GetAllCommentesOnPostResponse,
} from './blogpost.resonse';
import { BLOG_POST_ROUTES, SEARCH_ROUTES } from 'src/constants/routes';
import responseUtils from 'src/utils/response.utils';
import type { Response } from 'express';
import { AuthGuard } from 'src/modules/guards/auth.guard';
import { RolesGuard } from 'src/modules/guards/role.guard';
import { USER_ROLES } from 'src/user/user-types';
import { OwnershipGuard } from 'src/modules/guards/ownership.guard';
import { SearchService } from './search.service';
import { SearchBlogPostDto } from './dto/search.dto';
import { SearchResponse } from './search.response';
import { ApiTags } from '@nestjs/swagger';
import { CreateCommentDto } from 'src/comments/dto/comment.dto';
import { CommentsService } from 'src/comments/comments.service';
import { type TokenPayload } from 'src/auth/auth-types';
import { CurrentUser } from 'src/modules/decorators/get-current-user.decorator';

@ApiTags(BLOG_POST_ROUTES.BLOG_POST)
@Controller(BLOG_POST_ROUTES.BLOG_POST)
export class BlogpostController {
  constructor(
    private readonly blogpostService: BlogpostService,
    private readonly searchService: SearchService,
    private readonly commentService: CommentsService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.AUTHOR))
  @Post(BLOG_POST_ROUTES.CREATE)
  @ApiSwaggerResponse(MessageResponse, {
    status: StatusCodes.CREATED,
  })
  async create(
    @CurrentUser() user: TokenPayload,
    @Res() res: Response,
    @Body() { title, content, summary, categoryId }: CreateBlogPostDto,
  ) {
    try {
      await this.blogpostService.create({
        title,
        categoryId,
        content,
        summary,
        authorId: user.id,
      });
      return responseUtils.success(res, {
        data: {
          message: SUCCESS_MESSAGES.CREATED,
        },
        status: StatusCodes.CREATED,
        transformWith: MessageResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @Get(BLOG_POST_ROUTES.GET_ALL)
  @ApiSwaggerResponse(GetAllBlogPostResponse, {
    status: StatusCodes.OK,
  })
  async findAll(
    @Res() res: Response,
    @Query() { page, limit, isPagination }: PaginationDto,
  ) {
    try {
      const result = await this.blogpostService.findAll(
        page,
        limit,
        isPagination,
      );
      return responseUtils.success(res, {
        data: result,
        transformWith: GetAllBlogPostResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @ApiSwaggerResponse(MessageResponse)
  @Patch(BLOG_POST_ROUTES.UPDATE)
  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.AUTHOR))
  async update(
    @Res() res: Response,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() { title, content, summary, categoryId }: UpdateBlogPostDto,
  ) {
    try {
      await this.blogpostService.update(user.id, id, {
        title,
        categoryId,
        content,
        summary,
      });
      return responseUtils.success(res, {
        data: {
          message: SUCCESS_MESSAGES.UPDATED,
        },
        transformWith: MessageResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @ApiSwaggerResponse(MessageResponse)
  @Delete(BLOG_POST_ROUTES.DELETE)
  remove(@Res() res: Response, @Param('id') id: string) {
    try {
      this.blogpostService.remove(id);
      return responseUtils.success(res, {
        data: {
          message: SUCCESS_MESSAGES.DELETED,
        },
        transformWith: MessageResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.AUTHOR), OwnershipGuard)
  @ApiSwaggerResponse(MessageResponse)
  @Patch(BLOG_POST_ROUTES.PUBLISH)
  publish(@Res() res: Response, @Param('id') id: string) {
    try {
      this.blogpostService.publish(id);
      return responseUtils.success(res, {
        data: {
          message: SUCCESS_MESSAGES.SUCCESS,
        },
        transformWith: MessageResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @ApiSwaggerResponse(SearchResponse, {
    status: StatusCodes.OK,
  })
  @Get(SEARCH_ROUTES.SEARCH)
  async search(@Res() res: Response, @Query() query: SearchBlogPostDto) {
    try {
      const result = await this.searchService.search(query);
      return responseUtils.success(res, {
        data: result,
        transformWith: SearchResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @Post(BLOG_POST_ROUTES.CREATE_COMMENT)
  @ApiSwaggerResponse(MessageResponse, {
    status: StatusCodes.CREATED,
  })
  async createComment(
    @Res() res: Response,
    @Param('id') postId: string,
    @Body() { content, authorId }: CreateCommentDto,
  ) {
    try {
      await this.commentService.create({ content, authorId, postId });
      return responseUtils.success(res, {
        data: {
          message: SUCCESS_MESSAGES.CREATED,
        },
        transformWith: MessageResponse,
        status: StatusCodes.CREATED,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }

  @Get(BLOG_POST_ROUTES.GET_COMMENTS_ON_POST)
  @ApiSwaggerResponse(GetAllCommentesOnPostResponse)
  async getCommentsOnPost(
    @Res() res: Response,
    @Query() { page, limit, isPagination }: PaginationDto,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.blogpostService.getCommentsOnPost(id, {
        page,
        limit,
        isPagination,
      });
      return responseUtils.success(res, {
        data: result,
        transformWith: GetAllCommentesOnPostResponse,
      });
    } catch (error) {
      return responseUtils.error({ res, error });
    }
  }
}
