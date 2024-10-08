import { Droppable, Draggable } from "react-beautiful-dnd";
import Task from "./Task";
import { Bin, Exclaim } from "./Icons";
import { doc, writeBatch, arrayRemove, } from 'firebase/firestore';
import { db } from "../lib/firebase";
import { debounce } from "../lib/utils";
import { useState, useRef } from "react";
import Modal from "./Modal";

const Column = ({
  column,
  tasks,
  allData,
  boardId,
  userId,
  filterBy,
  index,
}) => {
  const [modal, setModal] = useState(false);
  const [editingCol, setEditing] = useState(false);
  const colInput = useRef(null);

  const deleteCol = async (colId, tasks) => {
    const batch = writeBatch(db);

      // Remove column from order
      const columnOrderRef = doc(db, `users/${userId}/boards/${boardId}/columns`, "columnOrder");
      batch.update(columnOrderRef, {
          order: arrayRemove(colId),
      });

       // Delete column
       const colRef = doc(db, `users/${userId}/boards/${boardId}/columns`, colId);
       batch.delete(colRef);

      // Delete tasks within the column
      tasks.forEach((t) => {
        const taskRef = doc(db, `users/${userId}/boards/${boardId}/tasks`, t);
        batch.delete(taskRef);
    });

    // Commit the batch
    try {
      await batch.commit();
      setModal(false); // Close modal after deletion
    } catch (error) {
      console.error("Error deleting column and tasks:", error);
    }
  };

  const changeColName = debounce(async (e, colId) => {
    const newTitle = e.target.value;

    try {
      const colRef = db
        .collection(`users/${userId}/boards/${boardId}/columns`)
        .doc(colId);
      await colRef.update({ title: newTitle });
    } catch (error) {
      console.error("Error updating column name:", error);
    }
  }, 7000);

  const moveToInp = () => {
    setEditing(true);
    setTimeout(() => {
      colInput.current.focus();
    }, 50);
  };

  return (
    <>
      <Draggable draggableId={column.id} index={index} key={column.id}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            ref={provided.innerRef}
            className="mr-5"
          >
            <div style={{ background: "#d3e1fb", borderRadius:"12px",padding:"4px 9px" }}>
              <div
                {...provided.dragHandleProps}
                className="bg-blue-500 flex items-center justify-between px-4 py-1 rounded-lg"
              >
                <input
                  ref={colInput}
                  className={`sm:text-xl text-blue-700 text-lg px-2 w-10/12 ${
                    editingCol ? "" : "hidden"
                  }`}
                  onBlur={() => setEditing(false)}
                  type="text"
                  defaultValue={column.title}
                  onChange={(e) => changeColName(e, column.id)}
                />
                <h2
                  className={`sm:text-lg text-blue-100 truncate text-lg ${
                    editingCol ? "hidden" : ""
                  }`}
                  onClick={moveToInp}
                >
                  {column.title}{" "}
                </h2>
                <div
                  className="text-blue-50 hover:text-red-400 cursor-pointer transition duration-300"
                  onClick={() => setModal(true)}
                >
                  <Bin />
                </div>
              </div>
              <Droppable droppableId={column.id} type="task">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`shadow-sm h-full py-4 px-2 ${
                      snapshot.isDraggingOver
                        ? "bg-gradient-to-tl from-indigo-200 via-cyan-100 to-teal-200"
                        : ""
                    }`}
                  >
                    {tasks.map((t, i) => (
                      <Task
                        allData={allData}
                        id={t}
                        index={i}
                        key={t}
                        boardId={boardId}
                        userId={userId}
                        columnDetails={column}
                        filterBy={filterBy}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            <Modal
              modal={modal}
              setModal={setModal}
              ariaText="Column Delete confirmation"
            >
              <div className="md:px-12">
                <div className="text-yellow-600 mb-2">
                  <Exclaim />
                </div>
                <h2 className="text-base md:text-2xl text-gray-900 mb-2">
                  Are you sure you want to delete this column?
                </h2>
                <h3 className="text-red-600 text-sm md:text-lg">
                  This column and its tasks will be permanently deleted and it
                  cannot be undone.
                </h3>
                <div className="my-8 flex">
                  <button
                    className="border border-red-700 text-red-600 px-2 py-1 rounded-lg mr-4 text-sm md:text-base"
                    onClick={() => deleteCol(column.id, tasks)}
                  >
                    Yes, delete
                  </button>
                  <button
                    className="bg-blue-800 text-gray-100 px-2 py-1 rounded-lg text-sm md:text-base"
                    onClick={() => setModal(false)}
                  >
                    No, go back
                  </button>
                </div>
              </div>
            </Modal>
          </div>
        )}
      </Draggable>
    </>
  );
};

export default Column;
