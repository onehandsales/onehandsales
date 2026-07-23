-- CreateEnum
CREATE TYPE "ExternalCalendarProvider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "ExternalCalendarConnectionStatus" AS ENUM ('CONNECTED', 'RECONNECT_REQUIRED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "ExternalCalendarSourceStatus" AS ENUM ('SELECTED', 'UNSELECTED');

-- CreateEnum
CREATE TYPE "ScheduleSourceType" AS ENUM ('INTERNAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "ScheduleExternalSyncStatus" AS ENUM ('SYNCED', 'LOCAL_MODIFIED', 'GOOGLE_DELETED', 'LOCAL_DELETED');

-- AlterTable
ALTER TABLE "Schedule"
  ADD COLUMN "meetingUrl" TEXT,
  ADD COLUMN "isAllDay" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sourceType" "ScheduleSourceType" NOT NULL DEFAULT 'INTERNAL',
  ADD COLUMN "externalCalendarSourceId" UUID,
  ADD COLUMN "externalEventId" TEXT,
  ADD COLUMN "externalEventICalUid" TEXT,
  ADD COLUMN "externalEventEtag" TEXT,
  ADD COLUMN "externalHtmlLink" TEXT,
  ADD COLUMN "externalUpdatedAt" TIMESTAMPTZ(3),
  ADD COLUMN "lastExternalSyncedAt" TIMESTAMPTZ(3),
  ADD COLUMN "externalDeletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "externalSyncStatus" "ScheduleExternalSyncStatus",
  ADD COLUMN "deletedAt" TIMESTAMPTZ(3),
  ADD COLUMN "deletedByUserId" UUID,
  ADD COLUMN "trashExpiresAt" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "ExternalCalendarConnection" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "provider" "ExternalCalendarProvider" NOT NULL,
  "providerAccountId" TEXT,
  "providerAccountEmail" TEXT,
  "status" "ExternalCalendarConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
  "encryptedAccessToken" TEXT,
  "encryptedRefreshToken" TEXT,
  "tokenExpiresAt" TIMESTAMPTZ(3),
  "grantedScopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "connectedAt" TIMESTAMPTZ(3),
  "disconnectedAt" TIMESTAMPTZ(3),
  "reconnectRequiredAt" TIMESTAMPTZ(3),
  "lastSyncedAt" TIMESTAMPTZ(3),
  "lastSyncStartedAt" TIMESTAMPTZ(3),
  "lastSyncFailedAt" TIMESTAMPTZ(3),
  "lastSyncErrorCode" TEXT,
  "syncLockExpiresAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExternalCalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalCalendarSource" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "connectionId" UUID NOT NULL,
  "provider" "ExternalCalendarProvider" NOT NULL,
  "calendarId" TEXT NOT NULL,
  "calendarName" TEXT NOT NULL,
  "calendarTimeZone" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "isSystemCalendar" BOOLEAN NOT NULL DEFAULT false,
  "status" "ExternalCalendarSourceStatus" NOT NULL DEFAULT 'UNSELECTED',
  "syncToken" TEXT,
  "lastSyncedAt" TIMESTAMPTZ(3),
  "lastSyncFailedAt" TIMESTAMPTZ(3),
  "lastSyncErrorCode" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExternalCalendarSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCalendarConnection_userId_provider_key" ON "ExternalCalendarConnection"("userId", "provider");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_userId_status_idx" ON "ExternalCalendarConnection"("userId", "status");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_provider_providerAccountId_idx" ON "ExternalCalendarConnection"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_userId_lastSyncedAt_idx" ON "ExternalCalendarConnection"("userId", "lastSyncedAt");

-- CreateIndex
CREATE INDEX "ExternalCalendarConnection_userId_syncLockExpiresAt_idx" ON "ExternalCalendarConnection"("userId", "syncLockExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCalendarSource_userId_provider_calendarId_key" ON "ExternalCalendarSource"("userId", "provider", "calendarId");

-- CreateIndex
CREATE INDEX "ExternalCalendarSource_connectionId_status_idx" ON "ExternalCalendarSource"("connectionId", "status");

-- CreateIndex
CREATE INDEX "ExternalCalendarSource_userId_status_idx" ON "ExternalCalendarSource"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_userId_externalCalendarSourceId_externalEventId_key" ON "Schedule"("userId", "externalCalendarSourceId", "externalEventId");

-- CreateIndex
CREATE INDEX "Schedule_userId_sourceType_startAt_idx" ON "Schedule"("userId", "sourceType", "startAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_deletedAt_idx" ON "Schedule"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_trashExpiresAt_idx" ON "Schedule"("userId", "trashExpiresAt");

-- CreateIndex
CREATE INDEX "Schedule_externalCalendarSourceId_idx" ON "Schedule"("externalCalendarSourceId");

-- CreateIndex
CREATE INDEX "Schedule_userId_externalSyncStatus_idx" ON "Schedule"("userId", "externalSyncStatus");

-- AddForeignKey
ALTER TABLE "ExternalCalendarConnection" ADD CONSTRAINT "ExternalCalendarConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCalendarSource" ADD CONSTRAINT "ExternalCalendarSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCalendarSource" ADD CONSTRAINT "ExternalCalendarSource_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ExternalCalendarConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_externalCalendarSourceId_fkey" FOREIGN KEY ("externalCalendarSourceId") REFERENCES "ExternalCalendarSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
