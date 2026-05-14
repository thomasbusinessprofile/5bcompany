"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function NavLink({ href, children, className }: Props) {
  const pathname = usePathname() ?? "/";
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  const classes = [className, active ? "nav-active" : ""].filter(Boolean).join(" ");
  return (
    <Link aria-current={active ? "page" : undefined} className={classes || undefined} href={href}>
      {children}
    </Link>
  );
}
