-- CreateEnum
CREATE TYPE "IntakeStatus" AS ENUM ('PENDING', 'ROUTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'CLINICIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "Disposition" AS ENUM ('SEE_DOCTOR', 'URGENT_NOW');

-- CreateEnum
CREATE TYPE "TriageTag" AS ENUM ('RED', 'GREEN');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intake" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "complaint" TEXT NOT NULL,
    "bodyRegion" TEXT NOT NULL,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "status" "IntakeStatus" NOT NULL DEFAULT 'PENDING',
    "disposition" "Disposition",
    "room" TEXT,
    "queueNumber" TEXT,
    "queueSequence" INTEGER,
    "triageTag" "TriageTag" NOT NULL DEFAULT 'GREEN',
    "routedById" TEXT,
    "routedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_registrationNumber_key" ON "Patient"("registrationNumber");

-- CreateIndex
CREATE INDEX "Intake_patientId_idx" ON "Intake"("patientId");

-- CreateIndex
CREATE INDEX "Intake_status_idx" ON "Intake"("status");

-- CreateIndex
CREATE INDEX "Intake_triageTag_idx" ON "Intake"("triageTag");

-- CreateIndex
CREATE INDEX "Intake_ward_queueSequence_idx" ON "Intake"("ward", "queueSequence");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intake" ADD CONSTRAINT "Intake_routedById_fkey" FOREIGN KEY ("routedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
