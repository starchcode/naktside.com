import { getLinksData } from "@/libs/links_data";

export const revalidate = 60;

export default async function Home() {
  const links = await getLinksData();

  return (
   <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold text-center">naktside</h1>
    <p className="text-center text-gray-500">coming soon</p>
    <a
      href={links?.[0]?.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg hover:scale-105"
    >
      {links?.[0]?.name}
    </a>
   </div>
  );
}
