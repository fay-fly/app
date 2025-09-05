import FireOutline from "@/icons/FireOutline";
import axios from "axios";
import clsx from "clsx";
import { useState } from "react";
import FireFilled from "@/icons/FireFilled";

type LikeButtonProps = {
  likesCount: number;
  postId: number;
  likedByMe: boolean;
};

export default function LikeButton({
  likesCount,
  postId,
  likedByMe,
}: LikeButtonProps) {
  const [count, setCount] = useState(likesCount);
  const [hasLikedByMe, setHasLikedByMe] = useState(likedByMe);

  const onClick = async () => {
    const newLiked = !hasLikedByMe;
    setHasLikedByMe(newLiked);
    setCount((prevCount) => (newLiked ? prevCount + 1 : prevCount - 1));
    await axios.post("/api/posts/like", {
      postId,
    });
  };

  return (
    <div
      className={clsx(
        "flex gap-[4px] m-[8px] items-center cursor-pointer",
        hasLikedByMe ? "text-[#F458A3]" : "text-[#A0A0A0]"
      )}
      onClick={onClick}
    >
      {hasLikedByMe ? <FireFilled /> : <FireOutline />}
      {count}
    </div>
  );
}
