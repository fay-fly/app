type Props = {
  params: { id: string };
};

export default function Profile({ params }: Props) {
  return <h1>Profile ID: {params.id}</h1>;
}