CREATE INDEX IF NOT EXISTS "Skill_userId_updatedAt_idx"
ON "Skill"("userId", "updatedAt");

CREATE INDEX IF NOT EXISTS "LibraryContent_userId_updatedAt_idx"
ON "LibraryContent"("userId", "updatedAt");

CREATE INDEX IF NOT EXISTS "JournalEntry_userId_updatedAt_idx"
ON "JournalEntry"("userId", "updatedAt");
