-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_postId_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "postId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
