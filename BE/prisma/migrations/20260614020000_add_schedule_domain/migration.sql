-- CreateTable
CREATE TABLE "Schedule" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scheduleTitle" TEXT NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Seoul',
    "location" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleDeal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleDeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Schedule_userId_startAt_idx" ON "Schedule"("userId", "startAt");

-- CreateIndex
CREATE INDEX "Schedule_userId_createdAt_idx" ON "Schedule"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleDeal_scheduleId_dealId_key" ON "ScheduleDeal"("scheduleId", "dealId");

-- CreateIndex
CREATE INDEX "ScheduleDeal_userId_scheduleId_idx" ON "ScheduleDeal"("userId", "scheduleId");

-- CreateIndex
CREATE INDEX "ScheduleDeal_userId_dealId_idx" ON "ScheduleDeal"("userId", "dealId");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleDeal" ADD CONSTRAINT "ScheduleDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleDeal" ADD CONSTRAINT "ScheduleDeal_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleDeal" ADD CONSTRAINT "ScheduleDeal_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
