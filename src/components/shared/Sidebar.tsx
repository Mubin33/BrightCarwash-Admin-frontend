'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import { NAVIGATION_CONFIG } from '@/configs/navigation.config';
import { useAuth } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import type { SidebarProps, NavItem } from '@/types/navigation';
import { useGetBusinessProfileQuery } from '@/services/settings.api';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

function filterItemsByPermission(
  items: NavItem[],
  userPermissions: string[],
): NavItem[] {
  return items
    .filter((item) => {
      if (item.permission && !userPermissions.includes(item.permission))
        return false;
      if (item.subItems) {
        const filteredSubs = filterItemsByPermission(
          item.subItems,
          userPermissions,
        );
        if (filteredSubs.length === 0 && item.href === '') return false;
        return true;
      }
      return true;
    })
    .map((item) => {
      if (item.subItems) {
        return {
          ...item,
          subItems: filterItemsByPermission(item.subItems, userPermissions),
        };
      }
      return item;
    });
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [logoError, setLogoError] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const userPermissions = user?.permissions || [];

  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const activeIds = new Set<string>();
    NAVIGATION_CONFIG.forEach((section) => {
      section.items.forEach((item) => {
        if (item.subItems?.some((sub) => {
          // For root paths like "/ai-chatbox", only match exact path
          if (sub.href === '/ai-chatbox') {
            return pathname === sub.href;
          }
          return pathname === sub.href || pathname.startsWith(sub.href + '/');
        })) {
          activeIds.add(item.id);
        }
      });
    });
    return activeIds;
  });

  const { data: businessProfile } = useGetBusinessProfileQuery();
  const businessLogo = businessProfile?.logo;
  console.log('Business Profile:', businessProfile);
  console.log('STORAGE_URL:', STORAGE_URL);
  console.log('Business Logo:', businessLogo);

  const filteredConfig = NAVIGATION_CONFIG.map((section) => ({
    ...section,
    items: filterItemsByPermission(section.items, userPermissions),
  })).filter((section) => section.items.length > 0);

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '') return false;
    // For root paths like "/ai-chatbox", only match exact path
    if (href === '/ai-chatbox') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  }

  function isSubItemActive(subItems: NavItem[] | undefined): boolean {
    if (!subItems) return false;
    return subItems.some((item) => {
      if (item.href === '') return false;
      // For root paths like "/ai-chatbox", only match exact path
      if (item.href === '/ai-chatbox') {
        return pathname === item.href;
      }
      return pathname === item.href || pathname.startsWith(item.href + '/');
    });
  }

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Build the full logo URL
  const getLogoUrl = () => {
    if (!businessLogo) {
      console.log('No business logo found in profile');
      return null;
    }

    // If the logo already starts with http, return it as-is
    if (businessLogo.startsWith('http://') || businessLogo.startsWith('https://')) {
      return businessLogo;
    }

    // If the logo already contains /public/storage, prepend only the base URL
    if (businessLogo.includes('/public/storage')) {
      const base = API_BASE_URL?.replace('/api', '') || '';
      return `${base}${businessLogo}`;
    }

    // If STORAGE_URL is not set, log a warning
    if (!STORAGE_URL) {
      console.warn('STORAGE_URL is not set');
      return null;
    }

    // Ensure the logo path starts with a slash if STORAGE_URL doesn't end with one
    const logoPath = businessLogo.startsWith('/') ? businessLogo : `/${businessLogo}`;
    const fullUrl = `${STORAGE_URL}${logoPath}`;
    console.log('Generated logo URL:', fullUrl);
    return fullUrl;
  };

  const logoUrl = getLogoUrl();

  return (
    <>
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden adm-sidebar-overlay'
          onClick={onClose}
        />
      )}

      <aside
        className={`w-[250px] h-screen fixed top-0 left-0 flex flex-col py-4 sm:py-6 pl-4 sm:pl-6 pr-0 border-r border-[#ECEFF3] bg-[#0B1220] z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo - fixed at top */}
        <div className='flex flex-col items-center w-full shrink-0 mb-4 pr-3 sm:pr-4'>
          {logoUrl && !logoError ? (
            <div className='flex justify-center items-center w-full'>
              <Image
                src={logoUrl}
                alt='Logo'
                width={80}
                height={80}
                priority
                className='object-contain w-auto h-16'
                onError={() => {
                  console.error('Failed to load logo from URL:', logoUrl);
                  setLogoError(true);
                }}
                onLoad={() => {
                  console.log('Logo loaded successfully from:', logoUrl);
                  setLogoError(false);
                }}
              />
            </div>
          ) : (
            // Empty div to maintain spacing when logo is not available
            <div className='h-16 w-full' />
          )}
        </div>

        {/* Nav - scrollable middle section with scrollbar at right edge */}
        <nav className='flex-1 min-h-0 overflow-y-auto adm-sidebar-scroll w-full pr-0'>
          <div className='flex flex-col items-start gap-4 sm:gap-5 self-stretch pr-3 sm:pr-4'>
            {filteredConfig.map((section) => (
              <div
                key={section.title}
                className='flex flex-col items-start gap-2 sm:gap-3 self-stretch'
              >
                <span className='text-[#777980] font-geist text-[10px] sm:text-xs font-medium leading-[140%] tracking-[0.06px] uppercase px-1'>
                  {section.title}
                </span>
                <div className='flex flex-col items-start gap-0.5 sm:gap-1 self-stretch'>
                  {section.items.map((item) => {
                    const hasSubItems =
                      item.subItems && item.subItems.length > 0;
                    const isParentActive =
                      isActive(item.href) ||
                      (hasSubItems && isSubItemActive(item.subItems));
                    const isExpanded = expandedItems.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className='flex flex-col items-start gap-0.5 sm:gap-1 self-stretch'
                      >
                        <div className='flex items-center gap-0 w-full'>
                          {hasSubItems ? (
                            <button
                              onClick={() => toggleExpand(item.id)}
                              className={`flex flex-1 py-2.5 sm:py-[14px] px-3 sm:px-4 items-center justify-between rounded-lg font-inter text-sm sm:text-base font-normal leading-[124%] tracking-[0.08px] no-underline transition-colors duration-200 cursor-pointer ${isExpanded ? 'bg-white/5 text-white' : 'text-white/80 hover:bg-white/5'}`}
                            >
                              <div className='flex items-center gap-2 sm:gap-3'>
                                <Icon
                                  name={item.icon}
                                  width={18}
                                  height={18}
                                  className={`sm:w-5 sm:h-5 ${isExpanded ? 'opacity-100' : 'opacity-80'}`}
                                />
                                <span className='truncate'>{item.label}</span>
                              </div>
                              <ChevronDown
                                size={16}
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className={`flex-1 flex py-2.5 sm:py-[14px] px-3 sm:px-4 items-center gap-2 sm:gap-3 rounded-lg font-inter text-sm sm:text-base font-normal leading-[124%] tracking-[0.08px] no-underline transition-colors duration-200 cursor-pointer ${isParentActive ? 'bg-[#B23730] text-white' : 'text-white/80 hover:bg-white/5'}`}
                            >
                              <Icon
                                name={item.icon}
                                width={18}
                                height={18}
                                className={`sm:w-5 sm:h-5 ${isParentActive ? 'opacity-100' : 'opacity-80'}`}
                              />
                              <span className='truncate'>{item.label}</span>
                            </Link>
                          )}
                        </div>

                        {hasSubItems && isExpanded && (
                          <div className='flex flex-col pl-10 mt-3'>
                            {item.subItems?.map((subItem, index) => {
                              // For "All Chats" (root path), only match exact path
                              let isSubActive;
                              if (subItem.href === '/ai-chatbox') {
                                isSubActive = pathname === subItem.href;
                              } else {
                                isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                              }
                              const isLast =
                                index === (item.subItems?.length || 0) - 1;
                              return (
                                <div
                                  key={subItem.id}
                                  className='relative flex items-center min-h-10'
                                >
                                  <svg
                                    className='absolute -left-[11px] top-0'
                                    width='20'
                                    height='40'
                                    viewBox='0 0 20 40'
                                  >
                                    {!isLast && (
                                      <line
                                        x1='1'
                                        y1='11'
                                        x2='1'
                                        y2='40'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                      />
                                    )}
                                    <g transform='translate(0,0)'>
                                      <path
                                        d='M1 0 V10 Q1 18 9 18 H16'
                                        stroke='white'
                                        strokeWidth='1.5'
                                        fill='none'
                                      />
                                    </g>
                                  </svg>
                                  <Link
                                    href={subItem.href}
                                    onClick={onClose}
                                    className={`flex flex-1 ml-2 py-2 px-3 items-center gap-2 rounded-lg transition-colors ${isSubActive ? 'bg-[#B23730] text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
                                  >
                                    <Icon
                                      name={subItem.icon}
                                      width={18}
                                      height={18}
                                      color='white'
                                    />
                                    <span>{subItem.label}</span>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Logout - fixed at bottom */}
        <Button
          variant='sidebar'
          onClick={logout}
          className='flex mr-4 py-2.5 sm:py-[14px] px-3 sm:px-4 items-center gap-2 sm:gap-3 self-stretch rounded-lg bg-[#FFE6E6] border-none text-[#FF4345] font-inter text-sm sm:text-base font-normal leading-[124%] tracking-[0.08px] cursor-pointer shrink-0 mt-4'
        >
          <Icon
            name='logout'
            width={18}
            height={18}
            className='sm:w-5 sm:h-5'
          />
          <span>Log out</span>
        </Button>
      </aside>
    </>
  );
}