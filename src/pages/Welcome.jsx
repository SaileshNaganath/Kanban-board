
import useAuth from "../hooks/useAuth";
import { FiUser } from "react-icons/fi";
import Home from "./Home";
import kanbanImage from "../assets/kanban.jpg";
import "../App.css";

const Welcome = () => {
  const { user,loginAnonymously, logOut, error } = useAuth();


  // Handle network disconnection
  if (!navigator.onLine) {
    return (
      <div className="p-12">
        <div className="my-12">
          <h1 className="text-xl text-red-800">
            The network is disconnected. Connect and try again.
          </h1>
        </div>
      </div>
    );
  }

  // Handle error while logging in
  if (error) {
    return (
      <div>
        <h1>{error}</h1>
      </div>
    );
  }

  // Show home if user is logged in
  if (user) {
    return (
      <Home
        logOut={logOut}
        userId={user.uid}
        name={user.displayName}
        isAnon={user.isAnonymous}
      />
    );
  }

  // Show welcome screen if no user is logged in
  return (
    <section className="px-4 py-24 mx-auto max-w-7xl">
      <div className="w-full mx-auto text-left md:w-11/12 xl:w-9/12 md:text-center">
        <h1 className="mb-6 text-4xl font-extrabold leading-none tracking-normal text-gray-100 md:text-6xl md:tracking-tight">
          Kanban <br />
          <span className="block w-full text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500 lg:inline">
            Create fast and efficient kanban boards, easily
          </span>
        </h1>
        <p className="px-0 mb-6 text-lg text-gray-300 md:text-xl lg:px-24">
          As this is a normal trial version, your data is never saved. all your data will be erased when logging out.
        </p>
        <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
          <button
            onClick={loginAnonymously}
            className="inline-flex items-center w-36 p-3 rounded-md justify-evenly mb-2 btn btn-primary btn-lg sm:mb-0 mr-2 transition-colors duration-200 transform bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80 text-white uppercase font-semibold"
          >
            <FiUser /> Guest
          </button>
        </div>
      </div>
      <div className="w-full mx-auto mt-20 text-center md:w-10/12">
        <img
          src={kanbanImage}
          alt="kanban-board"
          className="w-full rounded-lg shadow-xl"
        />
      </div>
    </section>
  );
};

export default Welcome;
