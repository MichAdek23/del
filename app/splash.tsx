'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Set a delay before redirecting to onboarding
    const delay = setTimeout(() => {
      router.push('/onboarding');
    }, 3000); // 3 second delay

    return () => clearTimeout(delay);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
            <div className="text-4xl font-bold text-blue-600">D</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">Del</h1>

        {/* Subtitle */}
        <p className="text-blue-100 text-lg mb-12">Welcome</p>

        {/* Loading Spinner */}
        <div className="flex justify-center items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
