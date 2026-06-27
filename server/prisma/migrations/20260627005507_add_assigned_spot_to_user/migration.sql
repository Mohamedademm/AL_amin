-- AlterTable
ALTER TABLE "User" ADD COLUMN     "assignedSpotId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedSpotId_fkey" FOREIGN KEY ("assignedSpotId") REFERENCES "VendingSpot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
