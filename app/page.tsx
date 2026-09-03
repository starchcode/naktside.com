import { getLinksData } from "@/libs/links_data";
import { trackVisit } from "@/libs/visits_data";
import ContactReveal from "@/components/ContactReveal";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const links = await getLinksData();
  trackVisit(searchParams).catch(() => {});

  return (
   <div className="flex flex-col items-center justify-center h-screen">
    <div className='w-2/3 min-w-72 flex justify-start items-start flex-col' >
      <h1 className="text-4xl font-bold text-center">naktside</h1>
      <p className="text-left text-gray-500">Composer and producer based by the Irish Sea</p>
    </div>

    <div className="w-2/3 min-w-72 flex justify-center items-center">
      <ContactReveal />
    </div>

    <a
      href={links?.[0]?.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-8 rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg hover:scale-105"
    >
      {links?.[0]?.name}
    </a>
   </div>
  );
}
