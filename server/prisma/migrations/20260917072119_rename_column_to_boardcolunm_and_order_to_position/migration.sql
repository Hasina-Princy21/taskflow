/*
  Warnings:

  - You are about to drop the column `columnId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `Column` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `boardColumnId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Column" DROP CONSTRAINT "Column_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_columnId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "columnId",
DROP COLUMN "order",
ADD COLUMN     "boardColumnId" TEXT NOT NULL,
ADD COLUMN     "position" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Column";

-- CreateTable
CREATE TABLE "BoardColumn" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "BoardColumn_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BoardColumn" ADD CONSTRAINT "BoardColumn_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_boardColumnId_fkey" FOREIGN KEY ("boardColumnId") REFERENCES "BoardColumn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
