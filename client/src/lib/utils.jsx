import { db } from "./firebase";
import { doc, setDoc,getDoc } from 'firebase/firestore';
import { Low, Medium, High } from "../components/Icons";

export const extractPriority = (priority) => {
  switch (priority) {
    case "low": {
      return <Low />;
    }

    case "medium": {
      return <Medium />;
    }

    case "high": {
      return <High />;
    }

    default:
      return null;
  }
};

// Debouncing is a programming practice used to ensure that time-consuming tasks
// do not fire so often, that it stalls the performance of the web page.
// In other words, it limits the rate at which a function gets invoked
export const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

export const createBoardForAnons = async (userId) => {
 
  const tasks = [
    {
      id: "1",
      title: "Welcome to Kanban",
      description:
        "Kanban is an efficient kanban scheduler that focuses on speed, usability and beauty.",
      priority: "low",
      dateAdded: new Date(),
      todos: [],
    },

    {
      id: "2",
      title:
        "WIth Kanban, you can add descriptions to kanban boards for easier reference.",
      description:
        "## Kanban supports Markdown too!\n- Kanban fully supports Github flavoured Markdown.\n- You can do **bold** and *italic*.\n ```\n You can write code too!\n```\n>Pretend this is a great quote.\nTo learn more about Markdown, visit [here](https://commonmark.org/help/).",
      priority: "high",
      dateAdded: new Date(),
      todos: [],
    },

    {
      id: "3",
      title:
        "Click and hold your mouse on a column or board, then move it around",
      description: null,
      priority: "high",
      dateAdded: new Date(),
      todos: [],
    },

    {
      id: "4",
      title: "Big tasks? Don'nt worry, Kanban can make them simple",
      description:
        "Remember to make these steps actionable, achievable and small.",
      priority: "medium",
      dateAdded: new Date(),
      todos: [
        { id: 1, task: "First subtask", done: false },
        { id: 3, task: "And another", done: true },
        { id: 2, task: "You can reorder these too!", done: false },
      ],
    },

    {
      id: "5",
      title: "Tasks can be prioritized. Low, Medium or High",
      priority: "low",
      todos: [],
      description: "- High\n- Medium\n- Low",
    },

    {
      id: "6",
      title: "Wanna know how I built this? Check these resources 😊",
      priority: "medium",
      todos: [],
      description:
        "### Tell me your suggestions, feedback or anything at all!",
    },

    {
      id: "7",
      title:
        "Wanna change a column name? Just click on it and type your new name. Hit Enter when done 😊",
      priority: "low",
      todos: [],
      description: "",
    },
  ];

  const columns = [
    { title: "Feedback", taskIds: ["1", "2"] },
    { title: "On Track", taskIds: ["3", "5", "7"] },
    { title: "Completed", taskIds: ["6"] },
    { title: "Rolling Release", taskIds: ["4"] },
  ];

  const columnOrder = {
    id: "columnOrder",
    order: ["Feedback", "Rolling Release", "On Track", "Completed"],
  };

  try {
     // Check if board exists before updating
     const boardRef = doc(db, `users/${userId}/boards/first`);
     const boardSnap = await getDoc(boardRef);
     if (!boardSnap.exists()) {
      // Set board details
      await setDoc(boardRef, { name: "Welcome to Kaban 👋" });
    }
 
    // Set column order
    await setDoc(doc(db, `users/${userId}/boards/first/columns`, 'columnOrder'), columnOrder);

    // Set columns
    await Promise.all(columns.map((c) =>
      setDoc(doc(db, `users/${userId}/boards/first/columns`, c.title), { title: c.title, taskIds: c.taskIds })
    ));

    // Set tasks
    await Promise.all(tasks.map((t) =>
      setDoc(doc(db, `users/${userId}/boards/first/tasks`, t.id), t)
    ));
  } catch (error) {
    console.error('Error creating board for anons:', error);
  }
};
