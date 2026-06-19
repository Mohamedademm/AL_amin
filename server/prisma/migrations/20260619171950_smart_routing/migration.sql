-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "etaDays" INTEGER,
ADD COLUMN     "fulfilment" TEXT;

-- AlterTable
ALTER TABLE "VendingSpot" ADD COLUMN     "isWarehouse" BOOLEAN NOT NULL DEFAULT false;
