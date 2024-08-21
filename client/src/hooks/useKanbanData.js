import { useState, useEffect } from "react";
import { doc, onSnapshot, getDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

const useKanban = (userId, boardId) => {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [final, setFinal] = useState({ columnOrder: [], columns: {}, tasks: {} });
  const [boardName, setBoardName] = useState("");

  useEffect(() => {
   
    const tasksRef = collection(db, `users/${userId}/boards/${boardId}/tasks`);
    const unsubscribeTasks = onSnapshot(tasksRef, (snap) => {
      const documents = [];
      snap.forEach((d) => {
        documents.push({ id: d.id, ...d.data() });
      });
      setTasks(documents);
    });

    return () => unsubscribeTasks(); // Cleanup on unmount
  }, [userId, boardId]);

  useEffect(() => {
    const boardRef = doc(db, `users/${userId}/boards/${boardId}`);
    const fetchBoardName = async () => {
      const docSnap = await getDoc(boardRef);
      if (docSnap.exists()) {
        setBoardName(docSnap.data().name);
      }
    };

    fetchBoardName();
  }, [userId, boardId]);

  useEffect(() => {
    const columnsRef = collection(db, `users/${userId}/boards/${boardId}/columns`);
    const unsubscribeColumns = onSnapshot(columnsRef, (snap) => {
      const documents = [];
      snap.forEach((d) => {
        documents.push({ id: d.id, ...d.data() });
      });
      setColumns(documents);
    });

    return () => unsubscribeColumns(); // Cleanup on unmount
  }, [userId, boardId]);

  useEffect(() => {
    if (tasks.length && columns.length) {
      const finalObject = {};

      // Find the columnOrder document
      const co = columns.find((c) => c.id === "columnOrder");
      const cols = columns.filter((c) => c.id !== "columnOrder");


      finalObject.columnOrder = co?.order || [];
      finalObject.columns = {};
      finalObject.tasks = {};

      tasks.forEach((t) => (finalObject.tasks[t.id] = t));
      cols.forEach((c) => (finalObject.columns[c.id] = c));

      setFinal(finalObject);
    }
  }, [tasks, columns]);

  return { initialData: final, setInitialData: setFinal, boardName };
};

export default useKanban;

