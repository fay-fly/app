import Fire from "@/icons/Fire";
import axios from "axios";

type LikeButtonProps = {
  likesCount: number,
  postId: number,
}

export default function LikeButton({ likesCount, postId }: LikeButtonProps) {
  const likePost = async () => {
    await axios.post("/api/posts/like", {
      postId
    })
  }

  return <div className="flex gap-[4px] m-[8px] items-center" onClick={likePost}>
    <Fire />
    {likesCount}
  </div>;
}