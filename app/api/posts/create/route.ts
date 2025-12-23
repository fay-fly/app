import { NextRequest, NextResponse } from "next/server";
import { uploadImageVariants } from "@/utils/bunnyStorage";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { canCreatePosts } from "@/lib/permissions";
import { processImage } from "@/utils/imageProcessing";
import { ensurePostPublication } from "@/lib/ensurePostPublication";
import type { PostWithUser } from "@/types/postWithUser";

const prisma = new PrismaClient();

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const extractHashtags = (content: string) => {
  const matches = content.match(/#[A-Za-z0-9_]+/g) ?? [];
  const normalized = matches
    .map((tag) => tag.replace(/^#/, "").toLowerCase())
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(normalized));
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canCreatePosts(session.user.role)) {
    return NextResponse.json(
      { error: "Only creators and admins can create posts" },
      { status: 403 }
    );
  }

  const formData = await req.formData();

  const files = formData.getAll("images") as File[];
  const textValue = formData.get("text");
  const text = typeof textValue === "string" ? textValue : "";

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sessionUser = session.user as {
    id: number;
    username?: string | null;
    name?: string | null;
    email?: string | null;
  };

  const authorId = sessionUser.id;
  const fallbackUsername =
    sessionUser.username ??
    sessionUser.name ??
    sessionUser.email?.split("@")[0] ??
    "you";

  // Validate maximum number of images (10 max)
  if (files.length > 10) {
    return NextResponse.json(
      { error: "Maximum 10 images allowed per post" },
      { status: 400 }
    );
  }

  // Allowed image formats that browsers can display
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif'
  ];

  for (const file of files) {
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `File "${file.name}" has unsupported format. Please use JPEG, PNG, GIF, WebP, SVG, or AVIF.` },
        { status: 400 }
      );
    }
  }

  const uploadPromises = files.map(async (file) => {
    try {
      const processed = await processImage(file);
      const extension = processed.mimeType === "image/webp" ? "webp" : file.name.split(".").pop();
      const baseFilename = `${crypto.randomUUID()}.${extension}`;

      const urls = await uploadImageVariants(
        baseFilename,
        {
          thumbnail: processed.thumbnail.buffer,
          small: processed.small.buffer,
          medium: processed.medium.buffer,
          large: processed.large.buffer,
          original: processed.original.buffer,
        },
        processed.mimeType,
        processed.originalContentType,
        'posts'
      );

      return {
        url: urls.largeUrl,
        thumbnailUrl: urls.thumbnailUrl,
        smallUrl: urls.smallUrl,
        mediumUrl: urls.mediumUrl,
        originalUrl: urls.originalUrl,
        width: processed.large.width,
        height: processed.large.height,
      };
    } catch (error) {
      console.error("Failed to process image:", error);
      throw error;
    }
  });

  const processedImages = await Promise.all(uploadPromises);
  const hashtags = text ? extractHashtags(text) : [];

  const hasPublishedColumn = await ensurePostPublication(prisma);

  const postRecord = await prisma.post.create({
    data: {
      text,
      authorId,
      ...(hasPublishedColumn ? { published: false } : {}),
      media: {
        create: processedImages.map((img, index) => ({
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          smallUrl: img.smallUrl,
          mediumUrl: img.mediumUrl,
          originalUrl: img.originalUrl,
          width: img.width || 800,
          height: img.height || 600,
          order: index,
        })),
      },
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          bio: true,
          fullName: true,
          gender: true,
          pictureUrl: true,
          profileBgUrl: true,
          role: true,
          emailVerified: true,
        },
      },
      media: {
        orderBy: { order: "asc" },
        select: {
          url: true,
          thumbnailUrl: true,
          smallUrl: true,
          mediumUrl: true,
          originalUrl: true,
          width: true,
          height: true,
          order: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          pins: true,
        },
      },
    },
  });

  if (hashtags.length > 0) {
    await prisma.$transaction(async (tx) => {
      await tx.hashtag.createMany({
        data: hashtags.map((name) => ({ name })),
        skipDuplicates: true,
      });

      const hashtagRecords = await tx.hashtag.findMany({
        where: { name: { in: hashtags } },
        select: { id: true },
      });

      await tx.postHashtag.createMany({
        data: hashtagRecords.map((hashtag) => ({
          postId: postRecord.id,
          hashtagId: hashtag.id,
        })),
        skipDuplicates: true,
      });
    });
  }

  const mediaItems = postRecord.media.map(({ order, ...mediaRest }) => ({
    url: mediaRest.url,
    thumbnailUrl: mediaRest.thumbnailUrl ?? undefined,
    smallUrl: mediaRest.smallUrl ?? undefined,
    mediumUrl: mediaRest.mediumUrl ?? undefined,
    originalUrl: mediaRest.originalUrl ?? undefined,
    width: mediaRest.width,
    height: mediaRest.height,
  }));

  const formattedPost: PostWithUser = {
    id: postRecord.id,
    text: postRecord.text,
    published: hasPublishedColumn ? postRecord.published : true,
    likesCount: postRecord._count.likes,
    commentsCount: postRecord._count.comments,
    pinsCount: postRecord._count.pins,
    createdAt: postRecord.createdAt.toISOString(),
    media: mediaItems.length > 0 ? mediaItems : undefined,
    author: {
      id: postRecord.author?.id ?? authorId,
      username: postRecord.author?.username ?? fallbackUsername,
      bio: postRecord.author?.bio ?? "",
      fullName: postRecord.author?.fullName ?? "",
      gender: (postRecord.author?.gender as "male" | "female") ?? "male",
      pictureUrl: postRecord.author?.pictureUrl ?? "",
      profileBgUrl: postRecord.author?.profileBgUrl ?? "",
      role: postRecord.author?.role ?? "user",
      emailVerified: postRecord.author?.emailVerified ?? false,
    },
    likedByMe: false,
    pinnedByMe: false,
    isFollowed: true,
    isPinned: false,
    pinnedBy: null,
  };

  return NextResponse.json({
    success: true,
    post: formattedPost,
    previewSupported: hasPublishedColumn,
  });
}
