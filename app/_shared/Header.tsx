'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@base-ui/react';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';

function Header() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null; // prevents hydration issues

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="logo" width={40} height={40} />
        <h1 className="text-2xl font-bold text-gray-800">Auto UIUX</h1>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="flex items-center gap-6 font-medium text-gray-700">
          <li className="cursor-pointer hover:text-[oklch(0.696_0.1759_28.14)] transition-colors">
            Home
          </li>
          <li className="cursor-pointer hover:text-[oklch(0.696_0.1759_28.14)] transition-colors">
            Pricing
          </li>
        </ul>
      </nav>

      {/* Auth Section */}
      {!user ? (
        <SignInButton mode='modal'>
        <Button className="rounded-xl px-5 py-2 font-semibold text-white bg-[oklch(0.696_0.1759_28.14)] hover:bg-[oklch(0.63_0.1759_28.14)] transition-colors">
          Get Started
        </Button>
        </SignInButton>
      ) : (
        <UserButton afterSignOutUrl="/" />
      )}
    </header>
  );
}

export default Header;
