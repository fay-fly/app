import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { PrismaClient, RecentSearchType } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json([]);
  }

  const recentSearches = await prisma.recentSearch.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: {
      searchedUser: {
        select: {
          id: true,
          username: true,
          pictureUrl: true,
          bio: true,
        },
      },
    },
  });

  const recentHashtagNames = Array.from(
    new Set(
      recentSearches
        .filter(
          (item) => item.type === RecentSearchType.HASHTAG && item.hashtag
        )
        .map((item) => (item.hashtag ?? "").toLowerCase())
    )
  ).filter(Boolean);

  let hashtagCounts: Record<string, number> = {};

  if (recentHashtagNames.length > 0) {
    const hashtagRecords = await prisma.hashtag.findMany({
      where: {
        name: {
          in: recentHashtagNames,
        },
      },
      select: {
        name: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    hashtagCounts = hashtagRecords.reduce<Record<string, number>>(
      (acc, hashtag) => {
        acc[hashtag.name.toLowerCase()] = hashtag._count.posts;
        return acc;
      },
      {}
    );
  }

  return NextResponse.json(
    recentSearches.map((item) =>
      item.type === RecentSearchType.USER
        ? {
            id: item.id,
            type: "user" as const,
            user: {
              id: item.searchedUser?.id ?? null,
              username: item.searchedUser?.username ?? null,
              pictureUrl: item.searchedUser?.pictureUrl ?? null,
              bio: item.searchedUser?.bio ?? null,
            },
          }
        : {
            id: item.id,
            type: "hashtag" as const,
            hashtag: item.hashtag ?? "",
            postsCount:
              item.hashtag
                ? hashtagCounts[item.hashtag.toLowerCase()] ?? 0
                : 0,
          }
    )
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;

  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, userId, hashtag } = await req.json();

  if (type === "user") {
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    await prisma.recentSearch.deleteMany({
      where: {
        ownerId,
        type: RecentSearchType.USER,
        searchedUserId: userId,
      },
    });

    await prisma.recentSearch.create({
      data: {
        ownerId,
        type: RecentSearchType.USER,
        searchedUserId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } else if (type === "hashtag") {
    const normalized = (hashtag as string | undefined)?.replace(/^#/, "").trim();

    if (!normalized) {
      return NextResponse.json(
        { error: "hashtag is required" },
        { status: 400 }
      );
    }

    await prisma.recentSearch.deleteMany({
      where: {
        ownerId,
        type: RecentSearchType.HASHTAG,
        hashtag: normalized.toLowerCase(),
      },
    });

    await prisma.recentSearch.create({
      data: {
        ownerId,
        type: RecentSearchType.HASHTAG,
        hashtag: normalized.toLowerCase(),
      },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;

  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const searchIdParam = searchParams.get("id");

  if (searchIdParam) {
    const searchId = Number(searchIdParam);
    if (Number.isNaN(searchId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await prisma.recentSearch.deleteMany({
      where: {
        id: searchId,
        ownerId,
      },
    });
  } else {
    await prisma.recentSearch.deleteMany({
      where: { ownerId },
    });
  }

  return NextResponse.json({ success: true });
}
