import Image from "next/image";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@naktside";
const INSTAGRAM_URL = "https://www.instagram.com/naktside/";
const FACEBOOK_URL = "https://www.facebook.com/naktside";
const SOUNDCLOUD_URL = "https://soundcloud.com/naktside";
const BLUESKY_URL = "https://bsky.app/profile/naktside.bsky.social";
const X_URL = "https://x.com/naktside";
const THREADS_URL = "https://www.threads.com/@naktside";

// X and Threads are monochrome brands — using the white variants below since
// the site is dark-themed. If a light background is ever enabled, swap
// these two src values for /logo-black.png and /threads-logo-black.png.

export default function SocialLinks() {
  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
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

      <div className="flex items-center gap-6">
        <a
          href={BLUESKY_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bluesky"
          className="transition-opacity hover:opacity-70"
        >
          <Image
            src="/bsky-app-logo.png"
            alt="Bluesky"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </a>

        <a
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="transition-opacity hover:opacity-70"
        >
          <Image
            src="/logo-white.png"
            alt="X"
            width={39}
            height={40}
            className="h-8 w-auto"
          />
        </a>

        <a
          href={THREADS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Threads"
          className="transition-opacity hover:opacity-70"
        >
          <Image
            src="/threads-logo-white.png"
            alt="Threads"
            width={36}
            height={40}
            className="h-9 w-auto"
          />
        </a>
      </div>
    </div>
  );
}
