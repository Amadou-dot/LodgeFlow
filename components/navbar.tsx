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
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  return (
    <HeroUINavbar maxWidth='xl' position='sticky' isBordered>
      <NavbarContent className='basis-1/5 sm:basis-full' justify='start'>
        <NavbarBrand as='li' className='gap-3 max-w-fit'>
          <NextLink className='flex justify-start items-center gap-2' href='/'>
            {mounted ? (
              <Image
                src={
                  resolvedTheme === 'dark'
                    ? '/logo-dark.png'
                    : '/logo-light.png'
                }
                alt='LodgeFlow'
                width={32}
                height={32}
                className='rounded-lg'
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
                className={clsx(
                  linkStyles({ color: 'foreground' }),
                  'transition-colors',
                  isActive(item.href)
                    ? 'text-green-600 font-semibold'
                    : 'hover:text-green-600'
                )}
                color='foreground'
                href={item.href}>
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className='hidden sm:flex basis-1/5 sm:basis-full'
        justify='end'>
        <NavbarItem className='hidden sm:flex gap-2'>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className='hidden md:flex'>
          <Button
            as={Link}
            href='/cabins'
            color='primary'
            variant='solid'
            size='sm'
            className='font-medium'>
            Book Now
          </Button>
        </NavbarItem>

        {/* Authentication Section */}
        <NavbarItem className='hidden md:flex gap-2'>
          <SignedOut>
            <SignInButton mode='modal'>
              <Button
                color='default'
                variant='bordered'
                size='sm'
                className='font-medium'>
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode='modal'>
              <Button
                color='secondary'
                variant='bordered'
                size='sm'
                className='font-medium'>
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
            />
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
          />
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
                )}>
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <Button
              as={Link}
              href='/cabins'
              color='primary'
              variant='solid'
              size='md'
              className='w-full mt-4'>
              Book Now
            </Button>
          </NavbarMenuItem>

          {/* Mobile Authentication */}
          <NavbarMenuItem>
            <SignedOut>
              <div className='flex flex-col gap-2 mt-4'>
                <SignInButton mode='modal'>
                  <Button
                    color='default'
                    variant='bordered'
                    size='md'
                    className='w-full'>
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode='modal'>
                  <Button
                    color='secondary'
                    variant='bordered'
                    size='md'
                    className='w-full'>
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
