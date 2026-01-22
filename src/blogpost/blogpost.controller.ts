import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
} from '@nestjs/common';
import { BlogpostService } from './blogpost.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blogpost.dto';
import { SUCCESS_MESSAGES } from 'src/constants/messages.constants';
import { ApiSwaggerResponse } from 'src/modules/swagger/swagger.decorator';
import { MessageResponse } from 'src/modules/swagger/dtos/response.dtos';
import { StatusCodes } from 'http-status-codes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  BlogPostResponse,
  GetAllBlogPostResponse,
  GetAllCommentesOnPostResponse,
} from './blogpost.response';
import { BLOG_POST_ROUTES } from 'src/constants/routes';
import { messageResponse } from 'src/utils/response.utils';
import { AuthGuard } from 'src/modules/guards/auth.guard';
import { RolesGuard } from 'src/modules/guards/role.guard';
import { USER_ROLES } from 'src/user/user-types';
import { OwnershipGuard } from 'src/modules/guards/ownership.guard';
import { SearchBlogPostDto } from './dto/search.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateCommentDto } from 'src/comments/dto/comment.dto';
import { CommentsService } from 'src/comments/comments.service';
import { type TokenPayload } from 'src/auth/auth-types';
import { CurrentUser } from 'src/modules/decorators/get-current-user.decorator';
import { FILE_NAME, MAX_UPLOAD_COUNT } from 'src/constants/upload.constants';
import { FilesInterceptor } from '@nestjs/platform-express';
import { uploadOptions } from 'src/config/upload.config';
import { TransformWith } from '../modules/decorators/response-transformer.decorator';

@ApiTags(BLOG_POST_ROUTES.BLOG_POST)
@Controller(BLOG_POST_ROUTES.BLOG_POST)
export class BlogpostController {
  constructor(
    private readonly blogpostService: BlogpostService,
    private readonly commentService: CommentsService,
  ) {}

  @Post(BLOG_POST_ROUTES.CREATE)
  @UseInterceptors(FilesInterceptor(FILE_NAME, MAX_UPLOAD_COUNT, uploadOptions))
  @ApiSwaggerResponse(MessageResponse, {
    status: StatusCodes.CREATED,
  })
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.CREATED)
  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.AUTHOR))
  async create(
    @CurrentUser() user: TokenPayload,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() { title, content, summary, categoryId }: CreateBlogPostDto,
  ) {
    await this.blogpostService.create(
      {
        title,
        categoryId,
        content,
        summary,
        authorId: user.id,
      },
      files,
    );

    return messageResponse(SUCCESS_MESSAGES.CREATED);
  }

  @Get(BLOG_POST_ROUTES.GET_ALL)
  @ApiSwaggerResponse(GetAllBlogPostResponse, {
    status: StatusCodes.OK,
  })
  @TransformWith(GetAllBlogPostResponse)
  @HttpCode(StatusCodes.OK)
  async findAll(@Query() { q, isPagination, page, limit }: SearchBlogPostDto) {
    return await this.blogpostService.findAll(
      {
        page,
        limit,
        isPagination,
      },
      q,
    );
  }

  @Get(BLOG_POST_ROUTES.GET_ONE)
  @ApiSwaggerResponse(BlogPostResponse, {
    status: StatusCodes.OK,
  })
  @TransformWith(BlogPostResponse)
  @HttpCode(StatusCodes.OK)
  async findOne(@Param('slug') slug: string) {
    return await this.blogpostService.findOne(slug);
  }

  @Patch(BLOG_POST_ROUTES.UPDATE)
  @ApiSwaggerResponse(MessageResponse)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.AUTHOR))
  async update(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() { title, content, summary, categoryId }: UpdateBlogPostDto,
  ) {
    await this.blogpostService.update(user.id, id, {
      title,
      categoryId,
      content,
      summary,
    });
    return messageResponse(SUCCESS_MESSAGES.SUCCESS);
  }

  @Delete(BLOG_POST_ROUTES.DELETE)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  remove(@Param('id') id: string) {
    this.blogpostService.remove(id);
    return messageResponse(SUCCESS_MESSAGES.SUCCESS);
  }

  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.AUTHOR), OwnershipGuard)
  @ApiSwaggerResponse(MessageResponse)
  @Patch(BLOG_POST_ROUTES.PUBLISH)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  publish(@Param('id') id: string) {
    this.blogpostService.publish(id);
    return messageResponse(SUCCESS_MESSAGES.SUCCESS);
  }

  @Post(BLOG_POST_ROUTES.CREATE_COMMENT)
  @ApiSwaggerResponse(MessageResponse, {
    status: StatusCodes.CREATED,
  })
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.CREATED)
  @UseGuards(AuthGuard, RolesGuard(USER_ROLES.AUTHOR))
  async createComment(
    @CurrentUser() user: TokenPayload,
    @Param('id') postId: string,
    @Body() { content }: CreateCommentDto,
  ) {
    await this.commentService.create({ content, authorId: user.id, postId });
    return messageResponse(SUCCESS_MESSAGES.CREATED);
  }

  @Get(BLOG_POST_ROUTES.GET_COMMENTS_ON_POST)
  @ApiSwaggerResponse(GetAllCommentesOnPostResponse)
  @TransformWith(GetAllCommentesOnPostResponse)
  @HttpCode(StatusCodes.OK)
  async getCommentsOnPost(
    @Query() { page, limit, isPagination }: PaginationDto,
    @Param('id') id: string,
  ) {
    return await this.blogpostService.getCommentsOnPost(id, {
      page,
      limit,
      isPagination,
    });
  }
}
