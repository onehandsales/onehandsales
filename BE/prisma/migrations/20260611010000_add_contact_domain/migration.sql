-- CreateTable
CREATE TABLE "Contact" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactJobGradeId" UUID NOT NULL,
    "contactDepartmentId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactJobGrade" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobGradeName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactJobGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactDepartment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMemoLog" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoType" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactUserPrivateMemoLog" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "memoCiphertext" TEXT NOT NULL,
    "memoKeyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactUserPrivateMemoLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_userId_createdAt_idx" ON "Contact"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Contact_userId_username_idx" ON "Contact"("userId", "username");

-- CreateIndex
CREATE INDEX "Contact_userId_companyId_idx" ON "Contact"("userId", "companyId");

-- CreateIndex
CREATE INDEX "Contact_userId_contactDepartmentId_idx" ON "Contact"("userId", "contactDepartmentId");

-- CreateIndex
CREATE INDEX "Contact_userId_contactJobGradeId_idx" ON "Contact"("userId", "contactJobGradeId");

-- CreateIndex
CREATE INDEX "ContactJobGrade_userId_idx" ON "ContactJobGrade"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactJobGrade_userId_jobGradeName_key" ON "ContactJobGrade"("userId", "jobGradeName");

-- CreateIndex
CREATE INDEX "ContactDepartment_userId_idx" ON "ContactDepartment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactDepartment_userId_departmentName_key" ON "ContactDepartment"("userId", "departmentName");

-- CreateIndex
CREATE INDEX "ContactMemoLog_contactId_createdAt_idx" ON "ContactMemoLog"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMemoLog_userId_contactId_idx" ON "ContactMemoLog"("userId", "contactId");

-- CreateIndex
CREATE INDEX "ContactUserPrivateMemoLog_contactId_createdAt_idx" ON "ContactUserPrivateMemoLog"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "ContactUserPrivateMemoLog_userId_contactId_idx" ON "ContactUserPrivateMemoLog"("userId", "contactId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contactJobGradeId_fkey" FOREIGN KEY ("contactJobGradeId") REFERENCES "ContactJobGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contactDepartmentId_fkey" FOREIGN KEY ("contactDepartmentId") REFERENCES "ContactDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactJobGrade" ADD CONSTRAINT "ContactJobGrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactDepartment" ADD CONSTRAINT "ContactDepartment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMemoLog" ADD CONSTRAINT "ContactMemoLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMemoLog" ADD CONSTRAINT "ContactMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactUserPrivateMemoLog" ADD CONSTRAINT "ContactUserPrivateMemoLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactUserPrivateMemoLog" ADD CONSTRAINT "ContactUserPrivateMemoLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
