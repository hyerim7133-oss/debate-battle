'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Ensures Firebase is only initialized on the client side after hydration.
 * Provides debugging information if configuration is missing.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<{
    firebaseApp: any;
    auth: any;
    firestore: any;
  } | null>(null);

  useEffect(() => {
    // Initialize only on mount (client-side)
    const initializedServices = initializeFirebase();
    setServices(initializedServices);
  }, []);

  // Initializing state
  if (!services) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#16190E]">
        <div className="text-primary font-headline text-3xl italic uppercase animate-pulse">
          Initializing Battle...
        </div>
      </div>
    );
  }

  // Error state: Missing critical config
  if (!services.firebaseApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#16190E] p-8 text-center">
        <div className="max-w-md space-y-6">
          <h1 className="text-3xl font-headline font-black text-accent italic uppercase tracking-tighter">
            Arena Config Error
          </h1>
          <p className="text-gray-400 font-body">
            Firebase 환경 변수가 설정되지 않았습니다. <br/>
            브라우저 콘솔(F12)을 확인하여 누락된 변수를 확인하세요. <br/>
            Vercel 설정에서 <strong>NEXT_PUBLIC_FIREBASE_API_KEY</strong> 등을 추가해야 합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
