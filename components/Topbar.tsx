"use client";

import React from "react";
import {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "@/components/vendor/catalyst/navbar";
import BrandButton from "@/components/ui/BrandButton";
import { Avatar } from "@/components/vendor/catalyst/avatar";

export default function Topbar() {
  return (
    <header
      className="sticky top-0 z-50 bg-[--color-surface]/90 backdrop-blur-md border-b"
      style={{ borderColor: "var(--color-border)" }}
      role="banner"
    >
      {/* brand accent line */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[var(--content-max)] container-px">
        <Navbar className="h-[var(--topbar-h)]">
          {/* LEFT: Avatar → label → divider → Hub / Runs */}
          <NavbarSection>
            {/* Avatar */}
            <NavbarItem href="/account" className="!p-1.5" aria-label="Profile & settings">
              <Avatar
                initials="BZ"
                alt="Your profile"
                className="size-8"
                style={{
                  backgroundColor: "var(--color-primary)",  // gold disc
                  color: "#0b1220",                          // dark initials on gold
                  outlineColor: "color-mix(in oklab, black 25%, transparent)",
                }}
              />
            </NavbarItem>

            {/* Brand label → marketing site */}
            <NavbarItem
              href="https://bizzdev.ai"
              target="_blank"
              rel="noopener noreferrer"
              data-variant="brand"
              className="!px-2"
              title="Open marketing site"
            >
              <NavbarLabel className="!text-[--color-primary]">BizzDev.ai</NavbarLabel>
            </NavbarItem>

            {/* Divider in gold */}
            <NavbarDivider
              className="h-6 w-px"
              style={{ backgroundColor: "var(--color-primary)" }}
            />

            {/* Main nav (gold) */}
            <NavbarItem
              href="/dashboard/hub"
              className="!text-[--color-primary] hover:opacity-90"
              data-variant="nav"
            >
              Hub
            </NavbarItem>
            <NavbarItem
              href="/runs"
              className="!text-[--color-primary] hover:opacity-90"
              data-variant="nav"
            >
              Runs
            </NavbarItem>
          </NavbarSection>

          <NavbarSpacer />

          {/* RIGHT: Smaller Sign out */}
          <NavbarSection>
            <BrandButton
              href="/signout"
              className="!py-1.5 !px-2.5 !text-sm border-transparent"
            >
              Sign out
            </BrandButton>
          </NavbarSection>
        </Navbar>
      </div>
    </header>
  );
}

