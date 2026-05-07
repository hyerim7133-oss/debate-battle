// This file is deprecated. Please use the unified Firebase setup in '@/firebase'.
import { initializeFirebase } from '@/firebase';

const firebaseServices = initializeFirebase();
export const db = firebaseServices.firestore;
