// Shared visual used by both opengraph-image.tsx and twitter-image.tsx —
// Next's file conventions each need their own default export, but the
// actual card only needs writing once.
export const OG_SIZE = { width: 1200, height: 630 };

export function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        color: "#ededed",
      }}
    >
      <div style={{ display: "flex", fontSize: 120, fontWeight: 700 }}>
        naktside
      </div>
      <div style={{ display: "flex", fontSize: 36, color: "#9ca3af", marginTop: 24 }}>
        Composer and producer based by the Irish Sea
      </div>
    </div>
  );
}
