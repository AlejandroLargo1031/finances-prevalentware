-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "Movement" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "concept" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "MovementType" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
