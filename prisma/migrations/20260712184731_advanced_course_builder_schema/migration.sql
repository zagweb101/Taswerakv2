-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('UPLOAD', 'YOUTUBE', 'VIMEO', 'EMBED', 'MINIO');

-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('VIDEO', 'TEXT', 'PDF', 'AUDIO', 'LIVE', 'QUIZ', 'ASSIGNMENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LessonType" ADD VALUE 'ARTICLE';
ALTER TYPE "LessonType" ADD VALUE 'QUIZ';
ALTER TYPE "LessonType" ADD VALUE 'ASSIGNMENT';
ALTER TYPE "LessonType" ADD VALUE 'RESOURCE';
