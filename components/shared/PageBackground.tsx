import Image from 'next/image';

interface PageBackgroundProps {
  src: string;
}

export function PageBackground({ src }: PageBackgroundProps) {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none select-none"
      style={{ backgroundColor: 'var(--bg-image-canvas)' }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className="page-background-img object-contain object-center"
        draggable={false}
        aria-hidden="true"
      />
    </div>
  );
}
