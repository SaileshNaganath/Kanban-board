import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import useBoards from '../hooks/useBoards';

import Dashboard from '../components/Dashboard';


import { v4 as uuidv4 } from 'uuid';
import Loader from '../components/Loader';

const Home = ({ logOut, userId, name }) => {
  const boards = useBoards(userId);

  const addNewBoard = async (e) => {
    e.preventDefault();
    const uid = uuidv4();
    const boardName = e.target.elements.boardName.value;

    try {
        // Add new board document
    const boardRef = doc(db, `users/${userId}/boards`, uid);


    await setDoc(boardRef, { name: boardName });

      
         // Add column order document
    const columnOrder = { id: 'columnOrder', order: [] };
    const columnOrderRef = doc(db, `users/${userId}/boards/${uid}/columns`, 'columnOrder');


    await setDoc(columnOrderRef, columnOrder);


    // Clear the input field
    e.target.elements.boardName.value = '';

    } catch (error) {
      console.error('Error adding board:', error);
    }
  };

  const deleteBoard = async (id) => {
    try {
      await deleteDoc(doc(db, `users/${userId}/boards`, id));
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  return boards !== null ? (
<>
          <Dashboard
            deleteBoard={deleteBoard}
            logOut={logOut}
            boards={boards}
            addNewBoard={addNewBoard}
            name={name}
          />      
</>

  ) : (
    <Loader/>
  );
};

export default Home;
