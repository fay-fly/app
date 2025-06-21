import clsx from "clsx";
import Verified from "@/icons/Verified";
import Button from "@/components/Button";
import ThreeDots from "@/icons/ThreeDots";

export default function Post() {
  return <div>
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
        <Button type="button" className="bg-(--fly-primary) text-(--fly-white) px-[16px] py-[5px] min-h-[32px] h-[32px]">Subscribe</Button>
        <ThreeDots />
      </div>
    </div>
    <img src="/foto.png" alt="foto" className="w-full"/>
  </div>
}