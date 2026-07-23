import { useRef, useState, useCallback } from "react";

interface ImageMagnifierProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  zoom?: number;
  lensSize?: number;
}

/**
 * Hover magnifier. Uses direct DOM updates via refs (no state on move)
 * to avoid re-render lag. Disabled on touch / small screens.
 */
const ImageMagnifier = ({
  src,
  alt,
  className = "",
  imgClassName = "",
  zoom = 2.2,
  lensSize = 160,
}: ImageMagnifierProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  const handleEnter = useCallback(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (containerRef.current) {
      rectRef.current = containerRef.current.getBoundingClientRect();
    }
    setActive(true);
  }, []);

  const handleLeave = useCallback(() => {
    setActive(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = rectRef.current;
      const lens = lensRef.current;
      if (!rect || !lens) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const half = lensSize / 2;
        // lens position, clamped inside container
        const lx = Math.max(0, Math.min(rect.width - lensSize, x - half));
        const ly = Math.max(0, Math.min(rect.height - lensSize, y - half));
        // background focal point (percentage)
        const bx = (x / rect.width) * 100;
        const by = (y / rect.height) * 100;
        lens.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
        lens.style.backgroundPosition = `${bx}% ${by}%`;
      });
    },
    [lensSize],
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMove}
    >
      <img src={src} alt={alt} className={imgClassName} draggable={false} />
      <div
        ref={lensRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 rounded-full border-2 border-primary/70 shadow-gold bg-no-repeat will-change-transform"
        style={{
          width: lensSize,
          height: lensSize,
          backgroundImage: `url(${src})`,
          backgroundSize: `${zoom * 100}%`,
          opacity: active ? 1 : 0,
          transition: "opacity 150ms ease-out",
        }}
      />
    </div>
  );
};

export default ImageMagnifier;
