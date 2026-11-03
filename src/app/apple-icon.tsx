import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The home-screen icon: the same mark as icon.svg (a line that rose and fell, and a question), drawn at 180 px. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#3f4fd1", borderRadius: 40 }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path d="M12 40 L22 30 L30 35 L40 22 L46 29 L52 25" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="46" cy="44" r="9" fill="#ffffff" />
          <path d="M43.2 41.6a3 3 0 1 1 4.2 2.8c-.9.4-1.4 1-1.4 2" fill="none" stroke="#3f4fd1" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="46" cy="49.2" r="1.3" fill="#3f4fd1" />
        </svg>
      </div>
    ),
    size,
  );
}
