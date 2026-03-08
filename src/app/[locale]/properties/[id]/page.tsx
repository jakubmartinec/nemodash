// Placeholder — detail nemovitosti
export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Nemovitost #{id}</h1>
    </main>
  );
}
