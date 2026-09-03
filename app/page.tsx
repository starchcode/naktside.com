import { getYoutubeLinks } from "@/libs/links_data";
import { trackVisit } from "@/libs/visits_data";
import ContactReveal from "@/components/ContactReveal";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import GoToShortcut from "@/components/GoToShortcut";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@naktside";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const youtubeLinks = await getYoutubeLinks();
  trackVisit(searchParams).catch(() => {});

  return (
   <div className="flex flex-col items-center min-h-screen pt-24">
    <GoToShortcut keys={["g", "a"]} href="/admin" />
    <div className='w-2/3 min-w-72 flex justify-start items-start flex-col' >
      <h1 className="text-4xl font-bold text-center">naktside</h1>
      <p className="text-left text-gray-500">Composer and producer based by the Irish Sea</p>
    </div>

    <div className="w-2/3 min-w-72 flex justify-center items-center">
      <ContactReveal />
    </div>

    <a
      href={YOUTUBE_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-8 rounded-full bg-red-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg hover:scale-105"
    >
      YouTube
    </a>

    {youtubeLinks.map((link) => (
      <YouTubeEmbed key={link.id} link={link} />
    ))}
   </div>
  );
}
