import ProfileContent from "@/app/(public)/profile/[id]/components/ProfileContent";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Profile({ params }: PageProps) {
  const { id } = await params;
  return <ProfileContent id={Number(id)} />;
}
