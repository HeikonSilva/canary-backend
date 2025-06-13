/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `UserSecurityAnswer` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The required column `idPublic` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idPublic" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "displayName", "id", "name", "passwordHash", "updatedAt") SELECT "createdAt", "displayName", "id", "name", "passwordHash", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
CREATE TABLE "new_UserSecurityAnswer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answerHash" TEXT NOT NULL,
    CONSTRAINT "UserSecurityAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserSecurityAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SecurityQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserSecurityAnswer" ("answerHash", "id", "questionId", "userId") SELECT "answerHash", "id", "questionId", "userId" FROM "UserSecurityAnswer";
DROP TABLE "UserSecurityAnswer";
ALTER TABLE "new_UserSecurityAnswer" RENAME TO "UserSecurityAnswer";
CREATE UNIQUE INDEX "UserSecurityAnswer_userId_questionId_key" ON "UserSecurityAnswer"("userId", "questionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
