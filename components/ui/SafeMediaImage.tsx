import Image from "next/image";
import type { CSSProperties } from "react";
import { canUseNextImage } from "@/lib/media/images";

interface SafeMediaImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  preload?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "eager" | "lazy";
  style?: CSSProperties;
}

export function SafeMediaImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  preload,
  fetchPriority,
  loading,
  style,
}: SafeMediaImageProps) {
  if (canUseNextImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        preload={preload}
        fetchPriority={fetchPriority}
        loading={preload ? undefined : loading}
        style={style}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={preload ? "eager" : loading}
      fetchPriority={fetchPriority}
      style={style}
      decoding="async"
    />
  );
}
