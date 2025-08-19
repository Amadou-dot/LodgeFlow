'use client';

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from '@heroui/navbar';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { link as linkStyles } from '@heroui/theme';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { FaInstagram, FaFacebook } from 'react-icons/fa';

import { siteConfig } from '@/config/site';
import { ThemeSwitch } from '@/components/theme-switch';
import Image from 'next/image';
import { useTheme } from 'next-themes';
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
                  resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'
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
          <Link
            isExternal
            aria-label='Instagram'
            href={siteConfig.links.instagram}>
            <FaInstagram className='w-5 h-5 text-default-500 hover:text-green-600 transition-colors' />
          </Link>
          <Link
            isExternal
            aria-label='Facebook'
            href={siteConfig.links.facebook}>
            <FaFacebook className='w-5 h-5 text-default-500 hover:text-green-600 transition-colors' />
          </Link>
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
      </NavbarContent>

      <NavbarContent className='sm:hidden basis-1 pl-4' justify='end'>
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
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
