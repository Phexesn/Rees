import { ImageResponse } from "next/og";

/** The app icon: white house mark on brand blue. Rendered at any size. */
export function appIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d4ed8",
          borderRadius: size * 0.22,
        }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <path d="M3 11.5 12 4l9 7.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 10v9.5h13V10" stroke="white" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M10 19.5v-5h4v5" stroke="white" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
