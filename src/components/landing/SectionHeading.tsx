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
      <p className="mb-4 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--text-secondary)] sm:mb-5 md:text-[13px]">
        {eyebrow}
      </p>
      <h2 className="text-[clamp(2rem,8vw,3rem)] font-black leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl md:text-5xl [font-family:Georgia,serif]">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-[42rem] text-[12.5px] leading-6 text-[var(--text-secondary)] sm:mt-5 sm:text-[13px] sm:leading-7 md:text-[14px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
