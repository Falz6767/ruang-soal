-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT NOT NULL DEFAULT '[]',
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "isExample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worksheet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worksheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorksheetItem" (
    "id" TEXT NOT NULL,
    "worksheetId" TEXT NOT NULL,
    "questionId" TEXT,
    "position" INTEGER NOT NULL,
    "snapshot" TEXT NOT NULL,

    CONSTRAINT "WorksheetItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_grade_subject_type_idx" ON "Question"("grade", "subject", "type");

-- CreateIndex
CREATE INDEX "WorksheetItem_questionId_idx" ON "WorksheetItem"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "WorksheetItem_worksheetId_position_key" ON "WorksheetItem"("worksheetId", "position");

-- AddForeignKey
ALTER TABLE "WorksheetItem" ADD CONSTRAINT "WorksheetItem_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "Worksheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetItem" ADD CONSTRAINT "WorksheetItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
