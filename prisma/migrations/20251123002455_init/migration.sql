-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VOLUNTEER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "volunteer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "spiritualGifts" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "experience" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "volunteer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ministry" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "timeCommitment" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "leaderId" TEXT NOT NULL,
    CONSTRAINT "opportunities_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    CONSTRAINT "applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "applications_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_profiles_userId_key" ON "volunteer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_opportunityId_volunteerId_key" ON "applications"("opportunityId", "volunteerId");
