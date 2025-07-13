import PostContent from "@/app/(public)/post/[id]/components/PostContent";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Profile({ params }: PageProps) {
  const { id } = await params;
  return <PostContent id={Number(id)} />;
}
