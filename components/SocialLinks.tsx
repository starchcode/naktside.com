import Image from "next/image";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@naktside";
const INSTAGRAM_URL = "https://www.instagram.com/naktside/";
const FACEBOOK_URL = "https://www.facebook.com/naktside";
const SOUNDCLOUD_URL = "https://soundcloud.com/naktside";

export default function SocialLinks() {
  return (
    <div className="mt-8 flex items-center gap-6">
      <a
        href={YOUTUBE_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="transition-opacity hover:opacity-70"
      >
        <Image
          src="/yt_icon_trimmed.png"
          alt="YouTube"
          width={57}
          height={40}
          className="h-9 w-auto"
        />
      </a>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="transition-opacity hover:opacity-70"
      >
        <Image
          src="/Instagram_Glyph_Gradient.png"
          alt="Instagram"
          width={40}
          height={40}
          className="h-10 w-auto"
        />
      </a>

      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="transition-opacity hover:opacity-70"
      >
        <Image
          src="/Facebook_Logo_Primary.png"
          alt="Facebook"
          width={40}
          height={40}
          className="h-10 w-auto"
        />
      </a>

      <a
        href={SOUNDCLOUD_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="SoundCloud"
        className="transition-opacity hover:opacity-70"
      >
        <Image
          src="/soundcloud.jpg"
          alt="SoundCloud"
          width={40}
          height={40}
          className="h-10 w-auto"
        />
      </a>
    </div>
  );
}
