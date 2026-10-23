"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <span style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.02em" }}>ROTEX</span>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#a1a1aa", maxWidth: "28rem", margin: "0.5rem auto 0" }}>
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            background: "#fafafa",
            color: "#0a0a0a",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
