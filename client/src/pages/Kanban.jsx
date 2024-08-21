import { useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { doc, updateDoc, setDoc,arrayUnion } from "firebase/firestore";
import { db } from "../lib/firebase";
import Column from "../components/Column";
import Modal from "../components/Modal";
import AddTask from "../pages/AddTask";
import useAuth from "../hooks/useAuth";
import useKanbanData from "../hooks/useKanbanData.js";
import { debounce } from "../lib/utils";
import Loader from "../components/Loader";
import { IoArrowBackCircleOutline } from "react-icons/io5";

const Kanban = () => {
  const { user } = useAuth();
  const userId = user.uid;
  const { boardId } = useParams();

  const [modal, setModal] = useState(false);
  const { initialData, setInitialData, boardName } = useKanbanData(userId, boardId);
  const [filter, setFilter] = useState(null);
  const filters = ["high", "medium", "low"];
  
 

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const startColumn = initialData.columns[source.droppableId];
    const endColumn = initialData.columns[destination.droppableId];

    if (result.type === "task") {
      if (startColumn === endColumn) {
        const newTaskIds = Array.from(endColumn.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        const newColumn = {
          ...endColumn,
          taskIds: newTaskIds,
        };

        const newState = {
          ...initialData,
          columns: { ...initialData.columns, [endColumn.id]: newColumn },
        };

        setInitialData(newState);

        try {
          await updateDoc(doc(db, `users/${userId}/boards/${boardId}/columns`, startColumn.id), { taskIds: newTaskIds });
        } catch (error) {
          console.error("Error updating start column:", error);
        }
        return;
      }

      const startTaskIDs = Array.from(startColumn.taskIds);
      startTaskIDs.splice(source.index, 1);
      const newStart = {
        ...startColumn,
        taskIds: startTaskIDs,
      };

      const finishTaskIDs = Array.from(endColumn.taskIds);
      finishTaskIDs.splice(destination.index, 0, draggableId);
      const newFinish = {
        ...endColumn,
        taskIds: finishTaskIDs,
      };

      const newState = {
        ...initialData,
        columns: {
          ...initialData.columns,
          [startColumn.id]: newStart,
          [endColumn.id]: newFinish,
        },
      };

      setInitialData(newState);

      try {
        await updateDoc(doc(db, `users/${userId}/boards/${boardId}/columns`, newStart.id), { taskIds: startTaskIDs });
        await updateDoc(doc(db, `users/${userId}/boards/${boardId}/columns`, newFinish.id), { taskIds: finishTaskIDs });
      } catch (error) {
        console.error("Error updating columns:", error);
      }
    } else {
      const newColumnOrder = Array.from(initialData.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = { ...initialData, columnOrder: newColumnOrder };
      setInitialData(newState);

      try {
        await updateDoc(doc(db, `users/${userId}/boards/${boardId}/columns`, "columnOrder"), { order: newColumnOrder });
      } catch (error) {
        console.error("Error updating columnOrder:", error);
      }
    }
  };

  const addCol = async (e) => {
    e.preventDefault();
    const newColumnName = e.target.elements.newCol.value;

    try {
      await setDoc(doc(db, `users/${userId}/boards/${boardId}/columns`, newColumnName), { title: newColumnName, taskIds: [] });
      await updateDoc(doc(db, `users/${userId}/boards/${boardId}/columns`, "columnOrder"), {
        order:arrayUnion(newColumnName),
      });
    } catch (error) {
      console.error("Error adding new column:", error);
    }

    e.target.elements.newCol.value = "";
  };

  const changeBoardName = debounce(async (ev) => {
    try {
      await updateDoc(doc(db, `users/${userId}/boards`, boardId), { name: ev });
    } catch (error) {
      console.error("Error updating board name:", error);
    }
  }, 7000);
 
  return (
    <>
      {initialData ?(
        <>
          <Modal modal={modal} setModal={setModal} ariaText="Add a new task">
            <AddTask
              boardId={boardId}
              userId={userId}
              allCols={initialData.columnOrder}
              close={() => setModal(false)}
            />
          </Modal>

          <main className="pb-2 h-screen w-screen">
            <div className="flex flex-col h-full">
              <header className=" z-10 text-sm sm:text-base py-5 mx-3 md:mx-6">
                <div className="flex flex-wrap justify-between items-center">
                  <span className="text-xl">

                  <Link
                      to="/"
                    >
                      <IoArrowBackCircleOutline  className="text-white h-[2em] w-[2em]"/>
                    </Link>
                    

                    <input
                      type="text"
                      defaultValue={boardName}
                      className="text-gray-100 ml-2 truncate bg-transparent border-none focus:border-none"
                      onChange={(e) => changeBoardName(e.target.value)}
                    />
                    
                  </span>
                  <div
                      className="text-white bg-blue-500 transform hover:scale-110 transition-all duration-300 rounded-lg px-6 py-3 sm:p-1 fixed bottom-6 right-6 sm:static"
                      onClick={() => setModal(true)}
                    >
                      Create Task
                    </div>
                  <div className="flex flex-wrap items-center sm:space-x-9">
                    <div className="flex items-center mt-2 sm:mt-0 ">
                      <h3 className="text-gray-100 mr-2 uppercase">
                        Filter Priority:{" "}
                      </h3>
                      <div className="space-x-4 text-blue-900 flex bg-indigo-50 rounded-lg">
                        {filters.map((f) => (
                          <div
                            key={f}
                            className={`px-3  border-black py-1 hover:bg-blue-400 hover:text-gray-100 cursor-pointer capitalize ${
                              filter === f ? "bg-blue-400 text-blue-50" : ""
                            }`}
                            onClick={() => setFilter(f === "all" ? null : f)}
                          >
                            {f}
                          </div>
                        ))}
                        {filter ? (
                          <div
                            className="px-2 py-1 cursor-pointer hover:text-blue-900 rounded-lg"
                            onClick={() => setFilter(null)}
                          >
                            All
                          </div>
                        ) : null}
                      </div>
                    </div>

                   
                  </div>
                </div>
              </header>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                  droppableId="allCols"
                  type="column"
                  direction="horizontal"
                >
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid overflow-x-auto h-full items-start pt-3 md:pt-2 mx-1 md:mx-6 auto-cols-220 md:auto-cols-270 grid-flow-col"
                      style={{ height: "90%" }}
                    >
                      {initialData?.columnOrder?.map((col, i) => {
                        const column = initialData?.columns[col];
                        
                        const tasks = column.taskIds?.map((t) => t);
                        return (
                          <Column
                            column={column}
                            tasks={tasks}
                            allData={initialData}
                            key={column.id}
                            boardId={boardId}
                            userId={userId}
                            filterBy={filter}
                            index={i}
                          />
                        );
                      })}
                      {provided.placeholder}
                      <form
                        onSubmit={addCol}
                        autoComplete="off"
                        className="ml-2"
                      >
                        <input
                          maxLength="20"
                          className="truncate bg-transparent placeholder-indigo-200 text-gray-100 bg-indigo-50 px-2 outline-none py-1 rounded-sm ring-2 focus:ring-indigo-100"
                          type="text"
                          name="newCol"
                          placeholder="Add a new column"
                        />
                      </form>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </main>
        </>
      ) : (
        <Loader/>
      )}
    </>
  );
};

export default Kanban;
