-- AlterTable
ALTER TABLE "VendingSpot" ADD COLUMN     "managerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VendingSpot_managerId_key" ON "VendingSpot"("managerId");

-- AddForeignKey
ALTER TABLE "VendingSpot" ADD CONSTRAINT "VendingSpot_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
