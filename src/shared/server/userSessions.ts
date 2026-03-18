import { Prisma } from '@prisma/client';

import prisma from '@/shared/lib/prisma';
import { getCurrentUser } from '@/shared/server/auth';
import { createClient } from '@/shared/supabase/server';
import {
  describeDeviceFromUserAgent,
  type SessionItem,
} from '@/components/settings/features/privacy/sessionUtils';

type SessionColumn =
  | 'id'
  | 'user_id'
  | 'created_at'
  | 'updated_at'
  | 'not_after'
  | 'user_agent';

type SessionColumnRow = {
  column_name: string;
};

type AuthSessionRow = Partial<Record<SessionColumn, string | Date | null>>;

export type UserSessionsResult =
  | { status: 'ok'; sessions: SessionItem[] }
  | { status: 'limited'; sessions: [] }
  | { status: 'unauthorized'; sessions: [] }
  | { status: 'error'; sessions: [] };

const SESSION_COLUMN_WHITELIST: readonly SessionColumn[] = [
  'id',
  'user_id',
  'created_at',
  'updated_at',
  'not_after',
  'user_agent',
];

let cachedSessionColumns: {
  expiresAt: number;
  available: Set<SessionColumn>;
  selected: SessionColumn[];
} | null = null;

function decodeJwtPayload(token: string | null | undefined) {
  if (!token) return null;

  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    try {
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function getCurrentSessionId(accessToken: string | null | undefined) {
  const payload = decodeJwtPayload(accessToken);
  return typeof payload?.session_id === 'string' ? payload.session_id : null;
}

function pickAvailableSessionColumns(columnRows: SessionColumnRow[]) {
  const available = new Set(
    columnRows
      .map((row) => row.column_name)
      .filter((column): column is SessionColumn =>
        (SESSION_COLUMN_WHITELIST as readonly string[]).includes(column)
      )
  );

  const selected = SESSION_COLUMN_WHITELIST.filter((column) => available.has(column));
  return {
    available,
    selected,
  };
}

async function getAvailableSessionColumns() {
  const now = Date.now();
  if (cachedSessionColumns && cachedSessionColumns.expiresAt > now) {
    return cachedSessionColumns;
  }

  const sessionColumns = await prisma.$queryRaw<SessionColumnRow[]>(Prisma.sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'auth'
      AND table_name = 'sessions'
  `);

  const resolved = pickAvailableSessionColumns(sessionColumns);
  cachedSessionColumns = {
    ...resolved,
    expiresAt: now + 5 * 60 * 1000,
  };

  return cachedSessionColumns;
}

function getOrderColumn(availableColumns: Set<SessionColumn>) {
  if (availableColumns.has('updated_at')) return 'updated_at';
  if (availableColumns.has('created_at')) return 'created_at';
  if (availableColumns.has('not_after')) return 'not_after';
  return 'id';
}

function toIsoString(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function toSessionItem(row: AuthSessionRow, currentSessionId: string | null): SessionItem | null {
  if (typeof row.id !== 'string' || !row.id) return null;

  const deviceMeta = describeDeviceFromUserAgent(
    typeof row.user_agent === 'string' ? row.user_agent : null
  );
  const lastSeenSource = toIsoString(row.updated_at) ?? toIsoString(row.created_at) ?? toIsoString(row.not_after);

  return {
    id: row.id,
    device: deviceMeta.device,
    location: 'Acesso registrado',
    lastSeen: lastSeenSource ?? 'Agora',
    isCurrent: currentSessionId === row.id,
    type: deviceMeta.type,
  };
}

export async function getUserSessions(): Promise<UserSessionsResult> {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    return { status: 'unauthorized', sessions: [] };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const currentSessionId = getCurrentSessionId(session?.access_token);

  try {
    const { available, selected } = await getAvailableSessionColumns();
    if (!available.has('id') || !available.has('user_id') || selected.length === 0) {
      return { status: 'limited', sessions: [] };
    }

    const orderColumn = getOrderColumn(available);
    const selectedColumnsSql = selected.map((column) => `"${column}"`).join(', ');

    const rows = await prisma.$queryRawUnsafe<AuthSessionRow[]>(
      `
        SELECT ${selectedColumnsSql}
        FROM auth.sessions
        WHERE "user_id" = $1::uuid
        ORDER BY "${orderColumn}" DESC NULLS LAST
        LIMIT 20
      `,
      user.id
    );

    const sessions = rows
      .map((row) => toSessionItem(row, currentSessionId))
      .filter((row): row is SessionItem => row !== null);

    return { status: 'ok', sessions };
  } catch (error) {
    console.error('[Sessions] Falha ao consultar auth.sessions:', error);
    return { status: 'limited', sessions: [] };
  }
}
