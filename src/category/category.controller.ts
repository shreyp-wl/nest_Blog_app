import { CATEGORY_ROUTES } from './../constants/routes';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { messageResponse } from 'src/utils/response.utils';
import { MessageResponse } from 'src/modules/swagger/dtos/response.dtos';
import { ApiSwaggerResponse } from 'src/modules/swagger/swagger.decorator';
import { SUCCESS_MESSAGES } from 'src/constants/messages.constants';
import { StatusCodes } from 'http-status-codes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CategoryResponse, GetAllCategoryResponse } from './category.response';
import { ApiTags } from '@nestjs/swagger';
import { TransformWith } from 'src/modules/decorators/response-transformer.decorator';
@ApiTags(CATEGORY_ROUTES.CATEGORY)
@Controller(CATEGORY_ROUTES.CATEGORY)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post(CATEGORY_ROUTES.CREATE)
  @ApiSwaggerResponse(MessageResponse, {
    status: StatusCodes.CREATED,
  })
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.CREATED)
  async create(@Body() { name, description }: CreateCategoryDto) {
    await this.categoryService.create({ name, description });
    return messageResponse(SUCCESS_MESSAGES.CREATED);
  }

  @Get(CATEGORY_ROUTES.GET_ALL)
  @ApiSwaggerResponse(GetAllCategoryResponse)
  @TransformWith(GetAllCategoryResponse)
  @HttpCode(StatusCodes.OK)
  async findAll(@Query() { page, limit, isPagination }: PaginationDto) {
    return await this.categoryService.findAll({
      page,
      limit,
      isPagination,
    });
  }

  @Get(CATEGORY_ROUTES.GET_ONE)
  @ApiSwaggerResponse(CategoryResponse)
  @TransformWith(CategoryResponse)
  @HttpCode(StatusCodes.OK)
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(id);
  }

  @Patch(CATEGORY_ROUTES.UPDATE)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  update(
    @Param('id') id: string,
    @Body() { name, description, isActive }: UpdateCategoryDto,
  ) {
    this.categoryService.update(id, { name, description, isActive });
    return messageResponse(SUCCESS_MESSAGES.SUCCESS);
  }

  @Delete(CATEGORY_ROUTES.DELETE)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(id);
    return messageResponse(SUCCESS_MESSAGES.SUCCESS);
  }
}
