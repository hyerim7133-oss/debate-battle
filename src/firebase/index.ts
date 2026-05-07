'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Initializes Firebase with the provided configuration.
 * Validates required options and logs missing variables for debugging.
 */
export function initializeFirebase() {
  const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value || value === 'undefined')
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(`[Firebase] Missing or invalid environment variables: ${missingVars.join(', ')}`);
    // Return nulls if critical variables are missing
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      return { firebaseApp: null, auth: null, firestore: null };
    }
  }

  try {
    const firebaseApp = getApps().length === 0 
      ? initializeApp(firebaseConfig) 
      : getApp();
    
    console.log("[Firebase] Successfully initialized");
    
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (e) {
    console.error("[Firebase] Initialization failed:", e);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
