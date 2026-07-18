export type NewsAudienceDto = {
  type: 'all' | 'grade' | 'class' | 'student';
  value?: string | null;
};

export type NewsWriteRequestDto = {
  title?: string;
  summary?: string;
  content?: string;
  image_url?: string | null;
  category?: string;
  audiences?: NewsAudienceDto[];
};

export type NewsListQueryDto = {
  page?: string | number;
  page_size?: string | number;
  q?: string;
  status?: 'draft' | 'published' | 'hidden';
};

export type NewsPinRequestDto = { is_pinned: boolean };
export type NewsReorderRequestDto = { sort_order: number };
