'use client';

import type { FeedbackTone } from './sessionUtils';
import { getFeedbackStyles } from './sessionUtils';

interface SessionFeedbackProps {
  tone: FeedbackTone;
  message: string;
}

export function SessionFeedback({ tone, message }: SessionFeedbackProps) {
  return (
    <div className="mb-4 rounded-lg border px-3 py-2 feedback-text" style={getFeedbackStyles(tone)}>
      {message}
    </div>
  );
}
