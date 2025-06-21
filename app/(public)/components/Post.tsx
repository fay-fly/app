import clsx from "clsx";
import Verified from "@/icons/Verified";
import Button from "@/components/Button";
import ThreeDots from "@/icons/ThreeDots";
import Comments from "@/icons/Comments";
import Fire from "@/icons/Fire";
import Pin from "@/icons/Pin";

export default function Post() {
  return <div className="flex flex-col gap-[8px] mb-[12px]">
    <div className="py-[8px] flex justify-between px-[16px]">
      <div className="flex gap-[8px] items-center">
        <div className="w-[32px] h-[32px] relative">
          <div
            className={clsx(
              "w-full h-full bg-(--fly-primary) flex",
              "justify-center items-center text-(--fly-white) rounded-full"
            )}
          >
            C
          </div>
        </div>
        <span className="text-(--fly-text-primary) font-semibold">
          carina_coco
        </span>
        <Verified/>
      </div>
      <div className="flex gap-[16px] items-center">
        <Button type="button" className="bg-(--fly-primary) text-(--fly-white) px-[16px] py-[5px] h-[32px]">Subscribe</Button>
        <ThreeDots />
      </div>
    </div>
    <img src="/foto.png" alt="foto" className="w-full"/>
    <div className="flex justify-between text-[#A0A0A0]">
      <div className="flex">
        <div className="flex gap-[4px] m-[8px] items-center"><Fire/>82</div>
        <div className="flex gap-[4px] m-[8px] items-center"><Comments/>12</div>
      </div>
      <div>
        <div className="flex gap-[4px] m-[8px] items-center"><Pin/>48</div>
      </div>
    </div>
    <div className="px-[16px] text-[#A0A0A0]">December 14</div>
  </div>
}