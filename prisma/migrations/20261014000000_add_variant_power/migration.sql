-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN "power" TEXT;

-- DropIndex
DROP INDEX "ProductVariant_productId_size_variantType_orifice_minOperatingTemp_maxOperatingTemp_flowFactor_key";

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_size_variantType_orifice_minOperatingTemp_maxOperatingTemp_flowFactor_power_key" ON "ProductVariant"("productId", "size", "variantType", "orifice", "minOperatingTemp", "maxOperatingTemp", "flowFactor", "power");
