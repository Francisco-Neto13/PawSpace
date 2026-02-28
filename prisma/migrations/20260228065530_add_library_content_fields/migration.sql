/*
  Warnings:

  - You are about to drop the column `description` on the `LibraryContent` table. All the data in the column will be lost.
  - Added the required column `userId` to the `LibraryContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LibraryContent" DROP COLUMN "description",
ADD COLUMN     "body" TEXT,
ADD COLUMN     "fileKey" TEXT,
ADD COLUMN     "metadata" JSONB DEFAULT '{}',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'link',
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "LibraryContent_userId_idx" ON "LibraryContent"("userId");
