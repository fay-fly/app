import Post from "@/app/(public)/components/Post";

export default function Home() {
  return <div className="w-full mr-auto ml-auto max-w-[630px]">
    <div className="flex flex-col gap-[5px]">
      <Post />
      <Post />
      <Post />
      <Post />
      <Post />
    </div>
  </div>;
}
