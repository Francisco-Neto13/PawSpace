interface PageBackgroundProps {
  src: string;
}

export function PageBackground({ src }: PageBackgroundProps) {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none select-none"
      style={{ backgroundColor: 'var(--bg-image-canvas)' }}
    >
      <img
        src={src}
        alt=""
        className="page-background-img w-full h-full object-contain object-center"
        draggable={false}
      />
    </div>
  );
}
