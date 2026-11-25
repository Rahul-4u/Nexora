"use client";

import { usePathname } from "next/navigation";
import { PublicFooter } from "./public-footer";

interface PublicFooterSwitchProps {
  siteName: string;
  phone: string;
  email: string;
  address: string;
}

export function PublicFooterSwitch(props: PublicFooterSwitchProps) {
  const pathname = usePathname();
  return <PublicFooter {...props} variant={pathname === "/" ? "home" : "inner"} />;
}
