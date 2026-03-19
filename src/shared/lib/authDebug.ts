type AuthDebugPayload = {
  stage: string;
  details: Record<string, unknown>;
};

export async function reportAuthDebug(payload: AuthDebugPayload) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  try {
    await fetch('/api/auth/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        reportedAt: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('[Auth Debug] Failed to report payload', error);
  }
}
