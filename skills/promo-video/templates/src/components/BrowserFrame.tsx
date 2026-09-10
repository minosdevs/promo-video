import type { CSSProperties, ReactNode } from "react";
import { brand } from "../brand";

// Fenetre de navigateur "mac-like" (3 feux + barre d'url) autour d'une capture 1920x1080 de Trkly.
// Le contenu est mis a l'echelle `scale` = width / 1920 : les coordonnees de boxes.ts (px CSS de la
// capture) se convertissent en px de la fenetre en multipliant par ce facteur.
export const CONTENT_W = 1920;
export const CONTENT_H = 1080;
export const CHROME_H = 52;

export const BrowserFrame: React.FC<{
  width: number;
  url: string;
  children: ReactNode;
  style?: CSSProperties;
}> = ({ width, url, children, style }) => {
  const scale = width / CONTENT_W;
  const contentH = CONTENT_H * scale;
  return (
    <div
      style={{
        width,
        height: contentH + CHROME_H,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "#0f0f11",
        boxShadow: "0 60px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
        ...style,
      }}
    >
      <div
        style={{
          height: CHROME_H,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 20px",
          backgroundColor: "#1c1c1f",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#ff5f57" }} />
        <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#febc2e" }} />
        <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#28c840" }} />
        <div
          style={{
            marginLeft: 24,
            flex: 1,
            maxWidth: 620,
            height: 30,
            borderRadius: 8,
            backgroundColor: "#0f0f11",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#a1a1aa",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: 0.2,
          }}
        >
          <span style={{ color: brand.accent, marginRight: 6 }}>●</span>
          {url}
        </div>
      </div>
      <div style={{ position: "relative", width, height: contentH, overflow: "hidden", backgroundColor: "#09090b" }}>
        {children}
      </div>
    </div>
  );
};
