import * as React from 'react';
import { cn } from '@/lib/utils';

type BubbleBackgroundProps = React.ComponentProps<'div'> & {
  interactive?: boolean;
};

function BubbleBackground({
  className,
  children,
  interactive = false,
  ...props
}: BubbleBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const blobRef = React.useRef<HTMLDivElement>(null);
  const rafIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        if (blobRef.current && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          blobRef.current.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px) translateZ(0)`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      data-slot="bubble-background"
      className={cn('relative size-full overflow-hidden bg-background', className)}
      style={{ contain: 'layout style paint' }}
      {...props}
    >
      <style>{`
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(0px, 0px) translateZ(0); }
          33%       { transform: translate(40px, -60px) translateZ(0); }
          66%       { transform: translate(-30px, 30px) translateZ(0); }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0px, 0px) translateZ(0); }
          50%       { transform: translate(-50px, 40px) translateZ(0); }
        }
        @keyframes blob-drift-3 {
          0%, 100% { transform: translate(0px, 0px) translateZ(0); }
          40%       { transform: translate(60px, 20px) translateZ(0); }
          80%       { transform: translate(-20px, -40px) translateZ(0); }
        }
        .blob-1 { animation: blob-drift-1 28s ease-in-out infinite; will-change: transform; }
        .blob-2 { animation: blob-drift-2 22s ease-in-out infinite; will-change: transform; animation-delay: -8s; }
        .blob-3 { animation: blob-drift-3 36s ease-in-out infinite; will-change: transform; animation-delay: -14s; }
        .blob-interactive { transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: transform; }
      `}</style>

      <div
        className="absolute inset-0 opacity-40 dark:opacity-25"
        style={{ filter: 'blur(60px)' }}
        aria-hidden="true"
      >
        <div
          className="blob-1 absolute rounded-full"
          style={{
            width: '70%',
            height: '70%',
            top: '5%',
            left: '5%',
            background: 'radial-gradient(circle at center, rgba(53,211,97,0.7) 0%, transparent 70%)',
          }}
        />
        <div
          className="blob-2 absolute rounded-full"
          style={{
            width: '60%',
            height: '60%',
            bottom: '5%',
            right: '5%',
            background: 'radial-gradient(circle at center, rgba(132,205,228,0.7) 0%, transparent 70%)',
          }}
        />
        <div
          className="blob-3 absolute rounded-full"
          style={{
            width: '55%',
            height: '55%',
            top: '30%',
            left: '30%',
            background: 'radial-gradient(circle at center, rgba(90,141,219,0.5) 0%, transparent 70%)',
          }}
        />
        {interactive && (
          <div
            ref={blobRef}
            className="blob-interactive absolute rounded-full"
            style={{
              width: '50%',
              height: '50%',
              top: '25%',
              left: '25%',
              background: 'radial-gradient(circle at center, rgba(53,211,97,0.35) 0%, transparent 70%)',
            }}
          />
        )}
      </div>

      <div className="relative z-10 size-full">
        {children}
      </div>
    </div>
  );
}

export { BubbleBackground, type BubbleBackgroundProps };
