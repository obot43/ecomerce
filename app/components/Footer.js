import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#f8f9fa",
        borderTop: "1px solidrgb(255, 255, 255)",
        padding: "1rem 0",
        textAlign: "center",
        fontSize: "0.95rem",
        color: "#6c757d",
        marginTop: "2rem",
      }}
    >
      © {new Date().getFullYear()} JualanOnline &mdash; All rights reserved.
    </footer>
  );
}