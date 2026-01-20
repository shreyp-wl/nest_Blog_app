import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogpostEntity } from 'src/modules/database/entities/blogpost.entity';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from 'src/constants/messages.constants';
import { generateSlug } from 'src/utils/blogpost.utils';
import { SORT_ORDER, SORTBY } from 'src/common/enums';
import {
  paginationInput,
  paginationMeta,
} from 'src/common/interfaces/pagination.interfaces';
import {
  BLOG_POST_SELECT,
  GET_COMMENTS_ON_POST_SELECT,
} from './blogpost.constants';

import {
  getOffset,
  getPageinationMeta,
} from 'src/common/helper/pagination.helper';
import {
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from './interfaces/blogpost.interface';
import { BLOG_POST_STATUS } from './blogpost-types';
import { COMMENT_STATUS } from 'src/comments/comments-types';
import { CommentEntity } from 'src/modules/database/entities/comment.entity';
import { findExistingEntity } from 'src/utils/db.utils';
import { CategoryEntity } from 'src/modules/database/entities/category.entity';

@Injectable()
export class BlogpostService {
  constructor(
    @InjectRepository(BlogpostEntity)
    private readonly blogPostRepository: Repository<BlogpostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createBlogPostInput: CreateBlogPostInput): Promise<void> {
    const existing = await this.blogPostRepository.exists({
      where: { title: createBlogPostInput.title },
    });

    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.CONFLICT);
    }

    const blogPost = this.blogPostRepository.create(createBlogPostInput);

    if (createBlogPostInput.categoryId) {
      const existingCategory = await findExistingEntity(
        this.categoryRepository,
        {
          id: createBlogPostInput.categoryId,
        },
      );

      if (!existingCategory) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }
      blogPost.categoryId = createBlogPostInput.categoryId;
    }

    blogPost.slug = generateSlug(blogPost.title);

    await this.blogPostRepository.save(blogPost);
  }

  async findAll(
    page: number,
    limit: number,
    isPagination: boolean,
  ): Promise<paginationMeta> {
    const queryBuilder = this.blogPostRepository
      .createQueryBuilder('post')
      .select(BLOG_POST_SELECT)
      .orderBy(`post.${SORTBY.CREATED_AT}`, SORT_ORDER.DESC);

    if (isPagination) {
      const offset = getOffset(page, limit);
      queryBuilder.skip(offset).take(limit);
    }
    const [items, total] = await queryBuilder.getManyAndCount();
    const result = getPageinationMeta({ items, page, limit, total });

    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} blogpost`;
  }

  async update(
    userId: string,
    id: string,
    updateBlogPostInput: UpdateBlogPostInput,
  ) {
    const blogPost = await this.blogPostRepository
      .createQueryBuilder('post')
      .where('post.id = :id', {
        id,
      })
      .getOne();

    if (!blogPost) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    const isOwnerOfPost = blogPost.authorId === userId;

    if (!isOwnerOfPost) {
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
    }

    if (updateBlogPostInput.content)
      blogPost.content = updateBlogPostInput.content;

    if (updateBlogPostInput.summary)
      blogPost.summary = updateBlogPostInput.summary;

    if (updateBlogPostInput.title) {
      blogPost.title = updateBlogPostInput.title;
      blogPost.slug = generateSlug(updateBlogPostInput.title, id);
    }

    if (updateBlogPostInput.categoryId) {
      const existingCategory = await findExistingEntity(
        this.categoryRepository,
        {
          id: updateBlogPostInput.categoryId,
        },
      );

      if (!existingCategory) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }
      blogPost.categoryId = updateBlogPostInput.categoryId;
    }

    await this.blogPostRepository.save(blogPost);
  }

  async remove(id: string) {
    const blogPost = await this.blogPostRepository.findOne({
      where: {
        id,
      },
    });

    if (!blogPost) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    await this.blogPostRepository.softRemove(blogPost);
  }

  async publish(id: string) {
    const blogPost = await this.blogPostRepository.preload({
      id,
      status: BLOG_POST_STATUS.PUBLISHED,
    });

    if (!blogPost) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    await this.blogPostRepository.save(blogPost);
  }

  async getCommentsOnPost(
    id: string,
    { page, limit, isPagination }: paginationInput,
  ) {
    const existingPost = await findExistingEntity(this.blogPostRepository, {
      id,
    });
    if (!existingPost) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }
    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'author')
      .select(GET_COMMENTS_ON_POST_SELECT)
      .where('comment.postId = :id', { id })
      .andWhere('comment.status = :status', {
        status: COMMENT_STATUS.APPROVED,
      });

    if (isPagination) {
      const skip = getOffset(page, limit);
      qb.skip(skip).limit(limit);
    }

    const [items, total] = await qb.getManyAndCount();
    const result = getPageinationMeta({ items, page, limit, total });
    return result;
  }
}
