"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
};

export function NavLink({ href, children }: Props) {
  const pathname = usePathname() ?? "/";
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link aria-current={active ? "page" : undefined} className={active ? "nav-active" : undefined} href={href}>
      {children}
    </Link>
  );
}
