export interface CreateBlogPostInput {
  title: string;
  content: string;
  summary?: string;
  authorId: string;
}

export interface UpdateBlogPostInput {
  title: string;
  content: string;
  summary?: string;
}
