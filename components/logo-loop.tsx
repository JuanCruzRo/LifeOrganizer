"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type NodeLogo = {
  node: ReactNode;
  title: string;
  href?: string;
};

type ImageLogo = {
  src: string;
  alt: string;
  href?: string;
};

type LogoLoopProps = {
  logos: Array<NodeLogo | ImageLogo>;
  speed?: number;
  direction?: "left" | "right";
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  scaleOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
  useCustomRender?: boolean;
};

function isImageLogo(logo: NodeLogo | ImageLogo): logo is ImageLogo {
  return "src" in logo;
}

export default function LogoLoop({
  logos,
  speed = 60,
  direction = "left",
  logoHeight = 55,
  gap = 55,
  hoverSpeed = 10,
  scaleOnHover = false,
  fadeOut = false,
  fadeOutColor = "#ffffff",
  ariaLabel = "Logo loop",
  useCustomRender = false
}: LogoLoopProps) {
  void useCustomRender;

  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const currentSpeedRef = useRef(speed);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const halfTrackWidthRef = useRef(0);
  const duplicatedLogos = useMemo(() => [...logos, ...logos], [logos]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const updateWidths = () => {
      halfTrackWidthRef.current = track.scrollWidth / 2;
    };

    updateWidths();

    const observer = new ResizeObserver(() => {
      updateWidths();
    });

    observer.observe(track);

    return () => {
      observer.disconnect();
    };
  }, [duplicatedLogos, gap, logoHeight]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const directionSign = direction === "left" ? -1 : 1;

    const animate = (timestamp: number) => {
      const lastTimestamp = lastTimestampRef.current ?? timestamp;
      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      const targetSpeed = isHovered ? hoverSpeed : speed;
      const smoothing = 8;
      const speedDelta = targetSpeed - currentSpeedRef.current;

      currentSpeedRef.current += speedDelta * Math.min(deltaSeconds * smoothing, 1);
      offsetRef.current += currentSpeedRef.current * directionSign * deltaSeconds;

      const loopWidth = halfTrackWidthRef.current;

      if (loopWidth > 0) {
        if (direction === "left" && Math.abs(offsetRef.current) >= loopWidth) {
          offsetRef.current += loopWidth;
        }

        if (direction === "right" && offsetRef.current >= loopWidth) {
          offsetRef.current -= loopWidth;
        }
      }

      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      lastTimestampRef.current = timestamp;
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [direction, hoverSpeed, isHovered, speed]);

  const style = {
    ["--logo-gap" as string]: `${gap}px`,
    ["--logo-height" as string]: `${logoHeight}px`,
    ["--fade-color" as string]: fadeOutColor
  } as CSSProperties;

  return (
    <div
      aria-label={ariaLabel}
      className={`logo-loop-root ${fadeOut ? "logo-loop-root-fade" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
    >
      <div className="logo-loop-marquee" ref={trackRef} role="presentation">
        {duplicatedLogos.map((logo, index) => {
          const key = isImageLogo(logo) ? `${logo.alt}-${index}` : `${logo.title}-${index}`;
          const title = isImageLogo(logo) ? logo.alt : logo.title;
          const href = logo.href;
          const content = isImageLogo(logo) ? (
            <span className="logo-loop-image-wrap">
              <Image
                alt={logo.alt}
                className="object-contain"
                fill
                sizes={`${logoHeight * 2}px`}
                src={logo.src}
              />
            </span>
          ) : (
            <span aria-hidden="true" className="logo-loop-icon-wrap">
              {logo.node}
            </span>
          );

          return href ? (
            <a
              className={`logo-loop-item ${scaleOnHover ? "logo-loop-item-scale" : ""}`}
              href={href}
              key={key}
              rel="noreferrer"
              target="_blank"
              title={title}
            >
              {content}
            </a>
          ) : (
            <div
              className={`logo-loop-item ${scaleOnHover ? "logo-loop-item-scale" : ""}`}
              key={key}
              title={title}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
