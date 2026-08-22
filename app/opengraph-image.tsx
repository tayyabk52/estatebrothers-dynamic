import { ImageResponse } from "next/og";

export const alt = "Estate Brothers - real estate, built on trust";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#2E4A3A",
          color: "#FAF6EC",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.16,
            backgroundImage:
              "linear-gradient(90deg, rgba(250,246,236,.55) 1px, transparent 1px), linear-gradient(rgba(250,246,236,.55) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          style={{
            width: 320,
            height: 320,
            position: "absolute",
            right: 84,
            bottom: 70,
            border: "2px solid rgba(250,246,236,.32)",
            transform: "rotate(45deg)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 54,
              height: 54,
              border: "2px solid #D7B56D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D7B56D",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            EB
          </div>
          <div style={{ fontSize: 24, letterSpacing: 3, textTransform: "uppercase" }}>
            DHA Lahore Property Advisory
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 104,
              fontWeight: 800,
              lineHeight: 0.92,
            }}
          >
            <span>Estate</span>
            <span>Brothers</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 28,
              color: "#D7B56D",
              fontSize: 42,
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
            }}
          >
            real estate, built on trust
          </div>
        </div>
      </div>
    ),
    size
  );
}
