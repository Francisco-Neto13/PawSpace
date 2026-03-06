interface PageBackgroundProps {
  src: string;
}

export function PageBackground({ src }: PageBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      <img
        src={src}
        alt=""
        className="w-full h-full object-contain object-center"
        style={{
          opacity: 0.12,
          filter: 'invert(1)',
          mixBlendMode: 'screen',
        }}
        draggable={false}
      />
    </div>
  );
}
