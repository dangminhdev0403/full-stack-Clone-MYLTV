export const FEEDBACK_STATUSES = ['new', 'in_progress', 'resolved'] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export type FeedbackListQueryDto = {
  page?: string | number;
  page_size?: string | number;
  q?: string;
  status?: FeedbackStatus;
};

export type FeedbackStatusUpdateDto = {
  status?: string;
};

export type FeedbackAdminListQuery = {
  page: number;
  page_size: number;
  q?: string;
  status?: FeedbackStatus;
};

export type FeedbackStatusCommand = {
  status: FeedbackStatus;
};
