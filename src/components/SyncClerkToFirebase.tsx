import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function SyncClerkToFirebase() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    // Only run when the user is fully loaded and logged in
    if (isLoaded && isSignedIn && user) {
      const syncUser = async () => {
        try {
          const userRef = doc(db, 'users', user.id);
          
          // Save or update the user's information in Firebase
          await setDoc(userRef, {
            fullName: user.fullName || "",
            email: user.primaryEmailAddress?.emailAddress || "",
            phone: user.primaryPhoneNumber?.phoneNumber || "",
            lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : new Date().toISOString(),
          }, { merge: true }); // merge: true ensures we don't overwrite existing custom fields
          
        } catch (error) {
          console.error("Error syncing user to Firebase:", error);
        }
      };

      syncUser();
    }
  }, [user, isLoaded, isSignedIn]);

  return null; // This component is invisible
}
