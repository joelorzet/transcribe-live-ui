import type { ReactNode } from "react";

export default function OverlayLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`body{background:transparent !important}`}</style>
      {children}
    </>
  );
}
