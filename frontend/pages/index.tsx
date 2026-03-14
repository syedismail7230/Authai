import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/verify');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white font-mono uppercase font-black tracking-widest text-2xl">
      LOADING_SYSTEM...
    </div>
  );
}
