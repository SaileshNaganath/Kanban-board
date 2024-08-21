import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Checked, Unchecked, Cross, Dragger } from "./Icons";
import { db } from "../lib/firebase";
import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { arrayUnion, arrayRemove, updateDoc, doc } from "firebase/firestore";

const CheckList = ({ todos, taskId, boardId, userId }) => {
  const [todoList, setList] = useState(todos);
  const newTaskRef = useRef(null);

  const addSubTask = async (e) => {
    if (e.key === "Enter" && e.target.value !== "") {
      const uid = uuidv4();
      const newTask = { id: uid, task: e.target.value, done: false };
      setList([...todoList, newTask]);

      try {
        const taskRef = doc(db, `users/${userId}/boards/${boardId}/tasks`, taskId);
        await updateDoc(taskRef, {
          todos: arrayUnion(newTask),
        });
      } catch (error) {
        console.error("Error adding subtask:", error);
      }

      newTaskRef.current.value = "";
    }
  };

  const checkMark = async (e, todo) => {
    const updatedTodoList = todoList.map((t) =>
      t.id === todo.id ? { ...t, done: !t.done } : t
    );
    setList(updatedTodoList);

    try {
      const taskRef = doc(db, `users/${userId}/boards/${boardId}/tasks`, taskId);
      await updateDoc(taskRef, { todos: updatedTodoList });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const deleteSubTask = async (taskId) => {
    const filtered = todoList.filter((t) => t.id !== taskId);
    setList(filtered);

    try {
      const taskRef = doc(db, `users/${userId}/boards/${boardId}/tasks`, taskId);
      await updateDoc(taskRef, { todos: filtered });
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  const endOfDrag = async (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const reorderedList = Array.from(todoList);
    const [movedItem] = reorderedList.splice(source.index, 1);
    reorderedList.splice(destination.index, 0, movedItem);

    setList(reorderedList);

    try {
      const taskRef = doc(db, `users/${userId}/boards/${boardId}/tasks`, taskId);
      await updateDoc(taskRef, { todos: reorderedList });
    } catch (error) {
      console.error("Error updating task order:", error);
    }
  };

  return (
    <div>
      <DragDropContext onDragEnd={endOfDrag}>
        <Droppable droppableId="Checklist">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {todoList.map((t, i) => (
                <Draggable draggableId={t.id} index={i} key={t.id}>
                  {(provided) => (
                    <div
                      className="flex items-center mt-3 w-full justify-between pr-6"
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <div className="flex w-2/3">
                        <div className="mr-1" onClick={(e) => checkMark(e, t)}>
                          {t.done ? <Checked /> : <Unchecked />}
                        </div>
                        <h4
                          className={`ml-2 ${
                            t.done ? "line-through text-gray-400" : ""
                          }`}
                        >
                          {t.task}
                        </h4>
                      </div>
                      <div
                        className="text-red-400 hover:text-red-700 cursor-pointer"
                        onClick={() => deleteSubTask(t.id)}
                      >
                        <Cross />
                      </div>
                      <div {...provided.dragHandleProps} className="text-gray-600">
                        <Dragger />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <input
        maxLength="40"
        ref={newTaskRef}
        type="text"
        name="task"
        placeholder="Add a sub task"
        onKeyPress={addSubTask}
        className="border-b border-gray-300 outline-none my-3 w-full"
      />
    </div>
  );
};

export default CheckList;
