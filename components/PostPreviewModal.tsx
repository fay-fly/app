import Image from "next/image";
import clsx from "clsx";
import Verified from "@/icons/Verified";
import Close from "@/icons/Close";
import UserText from "@/app/(public)/components/UserText";
import {getFormattedDate} from "@/utils/dates";
import {CommentList} from "@/components/comments/CommentList";
import LikeButton from "@/app/(public)/discover/components/LikeButton";
import Comments from "@/icons/Comments";
import PinButton from "@/app/(public)/discover/components/PinButton";
import {CommentForm} from "@/components/comments/CommentForm";
import ReactModal from "react-modal";
import {CommentWithUser, PostWithUser} from "@/app/types/postWithUser";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import UserCard from "@/app/(public)/components/UserCard";

type PostPreviewModalProps = {
  open: boolean;
  post: PostWithUser;
  onRequestClose: () => void;
}

export default function PostPreviewModal(props: PostPreviewModalProps) {
  const commentsRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [processing, setProcessing] = useState(false);
  const [firstRun, setFirstRun] = useState(true);

  useEffect(() => {
    if (!firstRun && commentsRef.current) {
      const commentsDivScrollHeight = commentsRef.current.scrollHeight;
      if (commentsDivScrollHeight) {
        commentsRef.current.scrollTop = commentsDivScrollHeight;
      }
    } else {
      setFirstRun(false);
    }
  }, [comments]);

  useEffect(() => {
    if (props.post.id) {
      setProcessing(true);
      axios
        .get<CommentWithUser[]>(`/api/comments/get?postId=${props.post.id}`)
        .then((response) => {
          setComments(response.data);
        })
        .finally(() => setProcessing(false));
    }
  }, [props.post.id]);

  const onCommentAdded = (newComment: CommentWithUser) => {
    setComments((prev) => {
      const update = [...(prev ?? [])];
      update.push(newComment);
      return update;
    });
  };

  return <ReactModal
    isOpen={props.open}
    ariaHideApp={false}
    shouldFocusAfterRender={false}
    onRequestClose={props.onRequestClose}
    className="w-full md:w-auto bg-white"
    style={{
      overlay: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(50, 50, 50, 0.70)"
      },
      content: {
        top: "auto",
        left: "auto",
        right: "auto",
        bottom: "auto",
        padding: 0,
        borderRadius: 0,
        border: "none",
      }
    }}

  >
    <div className="flex">
      <div className="justify-center items-center bg-black hidden md:flex">
        <Image
          src={props.post.imageUrl}
          alt="image"
          className="max-h-[708px] max-w-[612px] object-contain w-auto h-auto"
          unoptimized
          width={1}
          height={1}
        />
      </div>
      <div className="flex flex-col w-full md:w-[400px]">
        <div className="flex justify-between items-center px-[16px] py-[8px] border-b-1 border-(--fly-border-color)">
          <UserCard user={{
            username: props.post.author.username,
            image: props.post.author.pictureUrl,
          }} showStatus={false} />
          <button onClick={() => props.onRequestClose()} className="cursor-pointer">
            <Close />
          </button>
        </div>
        <div ref={commentsRef} className="flex-1 overflow-auto min-h-[554px] max-h-[554px]">
          <p className="px-[8px] text-[#5B5B5B] whitespace-pre-wrap overflow-auto">
                <span className="font-semibold">
                  {props.post.author.username}
                </span>{" "}
            <UserText postText={props.post.text} />
          </p>
          <div className="px-[8px] text-[#A0A0A0]">
            {getFormattedDate(props.post.createdAt)}
          </div>
          <CommentList comments={comments} />
        </div>
        <div className="flex justify-between text-[#A0A0A0]">
          <div className="flex">
            <LikeButton
              postId={props.post.id}
              likesCount={props.post.likesCount}
              likedByMe={props.post.likedByMe}
            />
            <div
              className="flex gap-[4px] m-[8px] items-center cursor-pointer"
            >
              <Comments />
              {props.post.commentsCount}
            </div>
          </div>
          <div>
            <div className="flex gap-[4px] m-[8px] items-center">
              <PinButton
                postId={props.post.id}
                pinsCount={props.post.pinsCount}
                pinnedByMe={props.post.pinnedByMe}
              />
            </div>
          </div>
        </div>
        <CommentForm postId={props.post.id} disabled={processing} onCommentAdded={onCommentAdded} />
      </div>
    </div>
  </ReactModal>
}