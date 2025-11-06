"use client";
import { useEffect, useRef } from "react";

type Props = {
  slot: string; // ad slot id
  className?: string;
  style?: React.CSSProperties;
};

export default function AdSlot({ slot, className, style }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  return (
    <ins
      ref={ref as any}
      className={`adsbygoogle ${className ?? ""}`}
      style={{ display: "block", minHeight: 250, ...style }}
      data-ad-client="ca-pub-4441724622178884"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
