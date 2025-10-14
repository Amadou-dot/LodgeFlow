'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/navbar';
import { link as linkStyles } from '@heroui/theme';
import clsx from 'clsx';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { ThemeSwitch } from '@/components/theme-switch';
import { siteConfig } from '@/config/site';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';
export const Navbar = () => {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Only render logo after component has mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <HeroUINavbar
      isBordered
      isMenuOpen={isMenuOpen}
      maxWidth='xl'
      position='sticky'
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className='basis-1/5 sm:basis-full' justify='start'>
        <NavbarBrand as='li' className='gap-3 max-w-fit'>
          <NextLink className='flex justify-start items-center gap-2' href='/'>
            {mounted ? (
              <Image
                alt='LodgeFlow'
                className='rounded-lg'
                height={32}
                width={32}
                src={
                  resolvedTheme === 'dark'
                    ? '/logo-dark.png'
                    : '/logo-light.png'
                }
              />
            ) : (
              <div className='w-8 h-8 bg-default-200 rounded-lg animate-pulse' />
            )}
          </NextLink>
        </NavbarBrand>
        <ul className='hidden lg:flex gap-6 justify-start ml-8'>
          {siteConfig.navItems.map(item => (
            <NavbarItem key={item.href}>
              <NextLink
                color='foreground'
                href={item.href}
                className={clsx(
                  linkStyles({ color: 'foreground' }),
                  'transition-colors',
                  isActive(item.href)
                    ? 'text-green-600 font-semibold'
                    : 'hover:text-green-600'
                )}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className='hidden sm:flex basis-1/5 sm:basis-full'
        justify='end'
      >
        {/* Authentication Section */}
        <NavbarItem className='hidden md:flex gap-2'>
          <SignedOut>
            <SignInButton mode='modal'>
              <Button
                className='font-medium'
                color='default'
                size='sm'
                variant='bordered'
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode='modal'>
              <Button
                className='font-medium'
                color='secondary'
                size='sm'
                variant='bordered'
              >
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  href='/bookings'
                  label='Booking History'
                  labelIcon={
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                      />
                    </svg>
                  }
                />
                <UserButton.Action
                  label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  labelIcon={
                    theme === 'dark' ? (
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                        />
                      </svg>
                    ) : (
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                        />
                      </svg>
                    )
                  }
                  onClick={toggleTheme}
                />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className='sm:hidden basis-1 pl-4' justify='end'>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                href='/bookings'
                label='Booking History'
                labelIcon={
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                    />
                  </svg>
                }
              />
              <UserButton.Action
                label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                labelIcon={
                  theme === 'dark' ? (
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                      />
                    </svg>
                  ) : (
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                      />
                    </svg>
                  )
                }
                onClick={toggleTheme}
              />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className='mx-4 mt-2 flex flex-col gap-2'>
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                as={NextLink}
                color='foreground'
                href={item.href}
                size='lg'
                className={clsx(
                  'transition-colors',
                  isActive(item.href)
                    ? 'text-green-600 font-semibold'
                    : 'hover:text-green-600'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}

          {/* Mobile Authentication */}
          <NavbarMenuItem>
            <SignedOut>
              <div className='flex flex-col gap-2 mt-4'>
                <SignInButton mode='modal'>
                  <Button
                    className='w-full'
                    color='default'
                    size='md'
                    variant='bordered'
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode='modal'>
                  <Button
                    className='w-full'
                    color='secondary'
                    size='md'
                    variant='bordered'
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
