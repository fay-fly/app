import Comments from "@/icons/Comments";
import {FormEvent, useState} from "react";
import ReactModal from "react-modal";
import Button from "@/components/Button";

type CommentButtonProps = {
  commentsCount: number
}

export default function CommentButton({ commentsCount }: CommentButtonProps) {
  const [open, setOpen] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Submit");
  }

  return <>
    <div className="flex gap-[4px] m-[8px] items-center cursor-pointer" onClick={() => setOpen((prev) => !prev)}>
      <Comments/>
      {commentsCount}
    </div>
    <ReactModal
      isOpen={open}
      ariaHideApp={false}
      shouldFocusAfterRender={false}
      onRequestClose={() => setOpen(false)}
    >
      <div>comments</div>
      <form onSubmit={onSubmit}>
        <textarea cols={30} rows={10}></textarea>
        <Button type="submit" className="bg-(--fly-bg-primary) border-2 border-[#A0A0A0] rounded-full cursor-pointer">Comment</Button>
      </form>
    </ReactModal>
  </>
}