import Post from "@/app/(public)/components/Post";

export default function Home() {
  return <div className="w-full bg-white mb-[48px]">
    <div className="w-full mr-auto ml-auto max-w-[630px]">
      <div className="flex flex-col gap-[12px] mb-[12px]">
        <Post/>
        <Post/>
        <Post/>
        <Post/>
        <Post/>
      </div>
    </div>
  </div>;
}
