-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_REPLIED';

-- DropIndex
DROP INDEX "user_name_trgm_idx";

-- DropIndex
DROP INDEX "user_username_trgm_idx";
