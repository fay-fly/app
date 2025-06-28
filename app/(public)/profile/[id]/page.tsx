interface PageProps {
  params: {
    id: string;
  };
}

export default function ProfilePage({ params }: PageProps) {
  return <h1>Profile ID: {params.id}</h1>;
}