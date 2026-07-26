-- Normalize legacy feedback workflow values to the implemented admin contract.
-- The guard keeps this data-only migration safe for installations whose
-- historical baseline did not create the optional feedback table.
DO $$
BEGIN
  IF to_regclass('public.feedback_items') IS NOT NULL THEN
    UPDATE public.feedback_items
    SET status = CASE
      WHEN status = 'closed' THEN 'resolved'
      ELSE 'new'
    END
    WHERE status NOT IN ('new', 'in_progress', 'resolved');

    ALTER TABLE public.feedback_items
      DROP CONSTRAINT IF EXISTS feedback_items_status_check;
    ALTER TABLE public.feedback_items
      ADD CONSTRAINT feedback_items_status_check
      CHECK (status IN ('new', 'in_progress', 'resolved'));
  END IF;
END $$;
