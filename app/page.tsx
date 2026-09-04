import { getEmbeddableLinks } from "@/libs/links_data";
import { trackVisit } from "@/libs/visits_data";
import ContactReveal from "@/components/ContactReveal";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import SoundCloudEmbed from "@/components/SoundCloudEmbed";
import GoToShortcut from "@/components/GoToShortcut";
import SocialLinks from "@/components/SocialLinks";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const embeddableLinks = await getEmbeddableLinks();
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

    <SocialLinks />

    <div className="w-2/3 min-w-72 flex flex-col items-center mb-16">
      {embeddableLinks.map((link) =>
        link.type === "youtube" ? (
          <YouTubeEmbed key={link.id} link={link} />
        ) : (
          <SoundCloudEmbed key={link.id} link={link} />
        )
      )}
    </div>
   </div>
  );
}
