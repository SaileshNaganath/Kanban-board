import { useState, useEffect } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

const useBoards = (userId) => {
  const [boards, setBoards] = useState(null);

  useEffect(() => {
    // Define the Firestore references
    const userRef = doc(db, "users", userId);
    const boardsRef = collection(userRef, "boards");

    // Set up the real-time listener
    const unsubscribe = onSnapshot(boardsRef, (snap) => {
      const documents = [];
      snap.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      setBoards(documents);
    }, (error) => {
      console.error("Error fetching boards: ", error);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [userId]);

  return boards;
};

export default useBoards;
