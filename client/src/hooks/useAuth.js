import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { createBoardForAnons } from "../lib/utils";


const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);


  const loginAnonymously = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      createBoardForAnons(userCredential.user.uid);
    } catch (error) {
      console.error("Error signing in anonymously:", error);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await setDoc(
            doc(db, "users", user.uid),
            { id: user.uid, name: user.displayName, email: user.email },
            { merge: true }
          );
        } catch (err) {
          console.error("Error writing user document:", err);
        }
      } 
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return {
    user,
    logOut,
    error,
    loginAnonymously,
    loading,
  };
};

export default useAuth;
