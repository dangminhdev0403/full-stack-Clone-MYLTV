export type NotificationListQueryDto = {
  page?: string | number;
  page_size?: string | number;
  limit?: string | number;
  q?: string;
  keyword?: string;
  tag?: string;
};

export type NotificationWriteRequestDto = {
  title?: string;
  sender?: string;
  content?: string;
  tag?: string;
};
