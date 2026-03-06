import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './LogoLoop.css';

export type LogoItem =
  | { node: React.ReactNode; href?: string; title?: string; ariaLabel?: string }
  | { src: string; alt?: string; href?: string; title?: string; };

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: 'left' | 'right';
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  className?: string;
}

const LogoLoop = React.memo<LogoLoopProps>(({
  logos,
  speed = 120,
  direction = 'left',
  logoHeight = 28,
  gap = 32,
  pauseOnHover = true,
  fadeOut = false,
  fadeOutColor,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);
  const [seqWidth, setSeqWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(2);
  const [isHovered, setIsHovered] = useState(false);

  const targetVelocity = useMemo(() => {
    const mag = Math.abs(speed);
    const dir = direction === 'left' ? 1 : -1;
    return mag * dir * (speed < 0 ? -1 : 1);
  }, [speed, direction]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceWidth = seqRef.current?.getBoundingClientRect()?.width ?? 0;
    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      const needed = Math.ceil(containerWidth / sequenceWidth) + 2;
      setCopyCount(Math.max(2, needed));
    }
  }, []);

  useEffect(() => {
    if (!window.ResizeObserver) return;
    const observers: ResizeObserver[] = [];
    [containerRef, seqRef].forEach(ref => {
      if (ref.current) {
        const obs = new ResizeObserver(updateDimensions);
        obs.observe(ref.current);
        observers.push(obs);
      }
    });
    updateDimensions();
    return () => observers.forEach(o => o.disconnect());
  }, [logos, gap, logoHeight]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || seqWidth <= 0) return;
    let raf: number;
    let lastTime: number | null = null;
    let offset = 0;
    let velocity = 0;

    const animate = (time: number) => {
      if (lastTime === null) { lastTime = time; }
      const dt = Math.max(0, time - lastTime) / 1000;
      lastTime = time;
      const target = isHovered && pauseOnHover ? 0 : targetVelocity;
      velocity += (target - velocity) * (1 - Math.exp(-dt / 0.25));
      offset = ((offset + velocity * dt) % seqWidth + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [targetVelocity, seqWidth, isHovered, pauseOnHover]);

  return (
    <div
      ref={containerRef}
      className={`logoloop ${fadeOut ? 'logoloop--fade' : ''} ${className || ''}`}
      style={{
        '--logoloop-gap': `${gap}px`,
        '--logoloop-logoHeight': `${logoHeight}px`,
        ...(fadeOutColor && { '--logoloop-fadeColor': fadeOutColor })
      } as React.CSSProperties}
    >
      <div
        ref={trackRef}
        className="logoloop__track"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {Array.from({ length: copyCount }, (_, ci) => (
          <ul
            className="logoloop__list"
            key={ci}
            ref={ci === 0 ? seqRef : undefined}
            aria-hidden={ci > 0}
          >
            {logos.map((item, ii) => (
              <li className="logoloop__item" key={`${ci}-${ii}`}>
                {'node' in item ? (
                  <span className="logoloop__node">{item.node}</span>
                ) : (
                  <img src={item.src} alt={item.alt || ''} loading="lazy" draggable={false} />
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
});

LogoLoop.displayName = 'LogoLoop';
export default LogoLoop;
