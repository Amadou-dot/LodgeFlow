import { title, subtitle } from '@/components/primitives';

interface PageHeaderProps {
  title: string;
  titleAccent?: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function PageHeader({
  title: pageTitle,
  titleAccent,
  subtitle: pageSubtitle,
  centered = true,
  className = '',
}: PageHeaderProps) {
  return (
    <section className={`${centered ? 'text-center' : ''} ${className}`}>
      <h1 className={title({ size: 'lg' })}>
        {pageTitle}
        {titleAccent && (
          <>
            {' '}
            <span className={title({ color: 'green', size: 'lg' })}>
              {titleAccent}
            </span>
          </>
        )}
      </h1>
      {pageSubtitle && (
        <p className={subtitle({ class: `mt-4 ${centered ? 'max-w-2xl mx-auto' : ''}` })}>
          {pageSubtitle}
        </p>
      )}
    </section>
  );
}
