// Shared caption row for embedded media players (YouTube, SoundCloud, …):
// "artist on Platform - Track title | N clicks", left-aligned, matching the
// original SoundCloud attribution's styling but 50% larger (10px -> 15px).
type Props = {
  platform: string;
  artistUrl: string;
  artistName?: string;
  trackUrl: string;
  trackTitle: string;
  clickCount: number | null;
};

export default function EmbedCaption({
  platform,
  artistUrl,
  artistName = "naktside",
  trackUrl,
  trackTitle,
  clickCount,
}: Props) {
  // In dev, always show the count so it's easy to check while testing.
  // In production, only once it's a meaningful number.
  const showCount =
    clickCount !== null && (process.env.NODE_ENV !== "production" || clickCount > 10);

  return (
    <div
      className="mt-2 text-left"
      style={{
        fontSize: "15px",
        color: "#cccccc",
        lineBreak: "anywhere",
        wordBreak: "normal",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        fontFamily:
          "Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif",
        fontWeight: 100,
      }}
    >
      <a
        href={artistUrl}
        title={`${artistName} on ${platform}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#cccccc", textDecoration: "none" }}
      >
        {artistName} on {platform.toLowerCase()}
      </a>{" "}
      -{" "}
      <a
        href={trackUrl}
        title={trackTitle}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#cccccc", textDecoration: "none" }}
      >
        {trackTitle}
      </a>
      {showCount && <> — {clickCount} clicks</>}
    </div>
  );
}
