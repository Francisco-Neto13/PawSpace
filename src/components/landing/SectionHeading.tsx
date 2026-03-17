'use client';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`mx-auto max-w-3xl text-center reveal-fade delay-0 ${className}`}>
      <p className="mb-5 text-[12px] font-black uppercase tracking-[0.24em] text-[var(--text-secondary)] md:text-[13px]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl md:text-5xl [font-family:Georgia,serif]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-[13px] leading-7 text-[var(--text-secondary)] md:text-[14px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
