'use client';

import { ReactNode } from 'react';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';

interface HeroSectionProps {
  title: string;
  titleAccent?: string;
  subtitle: string;
  buttons?: Array<{
    label: string;
    href: string;
    variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    startContent?: ReactNode;
  }>;
  backgroundImage?: string;
  className?: string;
}

export function HeroSection({
  title,
  titleAccent,
  subtitle,
  buttons = [],
  backgroundImage,
  className = '',
}: HeroSectionProps) {
  return (
    <section 
      className={`flex flex-col items-center justify-center gap-6 py-16 md:py-24 ${className}`}
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      <div className="text-center max-w-4xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {title}
          {titleAccent && (
            <>
              {' '}
              <span className="text-green-600 dark:text-green-400">
                {titleAccent}
              </span>
            </>
          )}
        </h1>
        <p className="text-lg text-default-600 mt-4 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {buttons.length > 0 && (
        <div className="flex gap-4 mt-8">
          {buttons.map((button, index) => (
            <Button
              key={index}
              as={Link}
              href={button.href}
              variant={button.variant || 'solid'}
              color={button.color || 'primary'}
              size="lg"
              className="px-8"
              startContent={button.startContent}
            >
              {button.label}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
