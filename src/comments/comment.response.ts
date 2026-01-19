import { Expose, Type } from 'class-transformer';
import { PaginationMetaResponse } from 'src/common/responses/pagination.response';
import { ApiPropertyWritable } from 'src/modules/swagger/swagger.writable.decorator';

export class CommentResponse {
  @Expose()
  id: string;
  @Expose()
  authorId: string;
  @Expose()
  postId: string;
  @Expose()
  content: string;
}

export class GetAllCommentResponse {
  @Expose()
  @ApiPropertyWritable({
    type: [CommentResponse],
  })
  @Type(() => CommentResponse)
  data: CommentResponse[];
  @ApiPropertyWritable({
    type: PaginationMetaResponse,
  })
  @Expose()
  @Type(() => PaginationMetaResponse)
  meta: PaginationMetaResponse;
}
