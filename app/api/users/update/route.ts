import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { uploadToBunny } from "@/utils/bunnyStorage";

const prisma = new PrismaClient();

type UpdateUserPayload = {
  fullName: string;
  username: string;
  gender: "male" | "female";
  bio: string;
  pictureUrl?: string;
  profileBgUrl?: string;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json()) as UpdateUserPayload;
  const { fullName, username, gender, bio, pictureUrl, profileBgUrl } = payload;

  if (!username || !gender) {
    return NextResponse.json(
      { error: "Username and gender are required" },
      { status: 400 }
    );
  }

  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    return NextResponse.json(
      { error: "Username cannot be empty" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: trimmedUsername },
  });

  if (existingUser && existingUser.id !== userId) {
    return NextResponse.json(
      { error: "Username is already taken" },
      { status: 400 }
    );
  }

  const updateData: Partial<UpdateUserPayload> = {
    fullName,
    username: trimmedUsername,
    gender,
    bio,
  };

  if (pictureUrl && pictureUrl.startsWith("data:")) {
    const base64Data = pictureUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const mimeType = pictureUrl.match(/data:([^;]+);/)?.[1] || "image/png";
    const extension = mimeType.split("/")[1];
    const uniqueName = `${userId}-${Date.now()}.${extension}`;

    const url = await uploadToBunny(buffer, uniqueName, mimeType, 'profiles');

    updateData.pictureUrl = url;
  } else if (pictureUrl) {
    updateData.pictureUrl = pictureUrl;
  }

  if (profileBgUrl && profileBgUrl.startsWith("data:")) {
    const base64Data = profileBgUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const mimeType = profileBgUrl.match(/data:([^;]+);/)?.[1] || "image/png";
    const extension = mimeType.split("/")[1];
    const uniqueName = `${userId}-${Date.now()}.${extension}`;

    const url = await uploadToBunny(buffer, uniqueName, mimeType, 'backgrounds');

    updateData.profileBgUrl = url;
  } else if (profileBgUrl) {
    updateData.profileBgUrl = profileBgUrl;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return NextResponse.json({
    status: 200,
    message: "Profile updated successfully",
  });
}
