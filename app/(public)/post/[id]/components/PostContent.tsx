"use client";
import { useEffect, useState } from "react";
import { HydratedPostWithUser, PostWithUser } from "@/types/postWithUser";
import axios from "axios";
import PageLoader from "@/components/PageLoader";
import Post from "@/app/(public)/components/Post";
import { hydratePostMedia } from "@/utils/mediaDimensions";

export default function PostContent({ id }: { id: number }) {
  const [post, setPost] = useState<HydratedPostWithUser>();

  useEffect(() => {
    let cancelled = false;

    axios
      .get<PostWithUser>(`/api/posts/get?id=${id}`)
      .then(async (response) => {
        if (cancelled) return;
        const hydrated = await hydratePostMedia(response.data);
        if (!cancelled) {
          setPost(hydrated);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div>
      {/*<div className="flex gap-[10px] p-[10px] md:p-[16px] border-b border-gray-200">*/}
      {/*  <Link href="" onClick={() => router.back()}>*/}
      {/*    <BackArrow />*/}
      {/*  </Link>*/}
      {/*  <h1>Post</h1>*/}
      {/*</div>*/}
      <div className="w-full mr-auto ml-auto max-w-[630px]">
        {!post ? <PageLoader /> : <Post post={post} />}
      </div>
    </div>
  );
}
