/*
  Warnings:

  - Made the column `endDate` on table `opportunities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `opportunities` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_opportunities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ministry" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "timeCommitment" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "leaderId" TEXT NOT NULL,
    CONSTRAINT "opportunities_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_opportunities" ("createdAt", "description", "endDate", "id", "leaderId", "location", "ministry", "requirements", "startDate", "status", "timeCommitment", "title", "updatedAt") SELECT "createdAt", "description", "endDate", "id", "leaderId", "location", "ministry", "requirements", "startDate", "status", "timeCommitment", "title", "updatedAt" FROM "opportunities";
DROP TABLE "opportunities";
ALTER TABLE "new_opportunities" RENAME TO "opportunities";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
