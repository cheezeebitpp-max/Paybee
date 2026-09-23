/*
  Warnings:

  - You are about to drop the column `account_number` on the `payouts` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `payouts` table. All the data in the column will be lost.
  - You are about to drop the column `ifsc` on the `payouts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payouts" DROP COLUMN "account_number",
DROP COLUMN "bank_name",
DROP COLUMN "ifsc",
ADD COLUMN     "bank_details_id" TEXT,
ADD COLUMN     "utr_number" TEXT;

-- AlterTable
ALTER TABLE "trades" ADD COLUMN     "crypto_asset" TEXT NOT NULL DEFAULT 'USDT',
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'SELL';

-- CreateTable
CREATE TABLE "bank_details" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "ifsc_code" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_bank_details_id_fkey" FOREIGN KEY ("bank_details_id") REFERENCES "bank_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
