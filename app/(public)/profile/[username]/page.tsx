import ProfileContent from "@/app/(public)/profile/[username]/components/ProfileContent";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function Profile({ params }: PageProps) {
  const { username } = await params;
  return <ProfileContent username={username} />;
}
