import clsx from "clsx";
import Verified from "@/icons/Verified";

export default function Post() {
  return <div className="px-[106px]">
    <div className="py-[8px] flex justify-between">
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
        <span className="text-(--fly-text-primary) font-semibold hidden md:block">
          carina_coco
        </span>
        <Verified/>
      </div>
      <div>
        <button>Subscribe</button>
      </div>
    </div>
    <img src="/foto.png" alt="foto" className="w-full"/>
  </div>
}