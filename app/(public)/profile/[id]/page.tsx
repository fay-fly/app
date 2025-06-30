interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Profile({ params }: PageProps) {
  const { id } = await params;
  return <h1>Profile ID: {id}</h1>;
}
