import { Link } from "react-router-dom";
import { useState } from "react";
import Modal from "./Modal";
import { Exclaim, Bin } from "./Icons";
import useAuth from "../hooks/useAuth";

const Dashboard = ({ boards, addNewBoard, deleteBoard, name }) => {
  const {logOut} = useAuth();
  const [modal, setModal] = useState(false);
  const [idToBeDeleted, setId] = useState(null);

  const removeBoard = (id) => {
    setModal(false);
    deleteBoard(id);
  };

  const openDeleteModal = (id) => {
    setId(id);
    setModal(true);
  };

  if (navigator.onLine !== true) {
    return (
      <div className="p-12">
        <div className="my-12">
          <h1 className="text-xl text-red-800">
            The network is disconnected. Connect and try again
          </h1>
        </div>
      </div>
    );
  } else
    return (
      <div className="border-none h-screen lg:bg-dashboard bg-no-repeat bg-center px-6 py-4 sm:py-20 sm:px-24">
        <Modal
          modal={modal}
          setModal={setModal}
          ariaText="Board Delete confirmation"
        >
          <div className="md:px-12 ">
            <div className="text-yellow-600 mb-2">
              <Exclaim />
            </div>
            <h2 className="text-base md:text-3xl text-gray-900 mb-2">
              Are you sure you want to delete this Board?
            </h2>
            <h3 className="text-red-600 text-sm md:text-lg">
              All of it&apos;s data will be permanently deleted and it cannot be
              undone.
            </h3>
            <div className="my-8 flex">
              <button
                className="border border-red-700 text-red-600 px-2 py-1 rounded-lg mr-4 text-sm md:text-base"
                onClick={() => removeBoard(idToBeDeleted)}
              >
                Yes, delete!
              </button>
              <button
                className="bg-gray-800 text-gray-100 px-2 py-1 rounded-lg text-sm md:text-base"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
        <div className="flex flex-col my-2">
          <div className="flex justify-between">
            <h1 className="text-xl sm:text-3xl font-semibold text-gray-100">
              👋 Welcome, {name ? name.split(" ")[0] : "Guest"}
            </h1>
            <button
              className="bg-red-500 hover:bg-red-800 text-white font-bold py-1 px-4 rounded-2xl transition duration-500 shadow-lg text-sm md:text-md"
              onClick={logOut}
            >
              Logout
            </button>
          </div>
          <form
            onSubmit={addNewBoard}
            autoComplete="off"
            className="my-4 sm:my-8"
          >
            <label htmlFor="boardName" className="block text-xl text-blue-200">
              Create your new board
            </label>
            <div className="flex items-center mt-2 max-w-md">
              <input
                required
                type="text"
                name="boardName"
                className="h-12 w-full focus:border-2 focus:border-cyan-700 appearance-none block bg-gray-200 text-gray-100 border border-gray-200 rounded-lg py-3 px-4 mr-2 leading-tight focus:outline-none focus:bg-transparent"
                placeholder="Board Title"
              />
              <button
                type="submit"
                className="inline-flex justify-evenly items-center w-20 px-6 py-3 rounded-2xl  shadow-lg btn btn-primary btn-lg  sm:mb-0 mr-2 transition-colors duration-200 transform bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80 text-white uppercase font-semibold"
              >
                Add
              </button>
            </div>
          </form>
          <div className="my-12">
            <h1 className="text-xl text-blue-200">Your Boards</h1>
            <div className="flex flex-wrap mt-2">
              {boards.map((b) => (
                <div
                  className="bg-white flex items-center rounded-lg text-gray-700 mb-3 mr-4 py-4 px-6 shadow-lg w-full sm:w-auto transform transition duration-500 hover:scale-105 border-l-8 hover:border-green-500 hover:z-20 flex-wrap"
                  key={b.id}
                >
                  <div className="flex items-center justify-between">
                    <Link to={`/board/${b.id}`}>
                      <h2 className="text-lg sm:text-2xl text-gray-700 hover:text-gray-900">
                        {b.name}
                      </h2>
                    </Link>
                    <div
                      onClick={() => openDeleteModal(b.id)}
                      className="text-red-500 ml-6 cursor-pointer hover:text-red-700"
                    >
                      <Bin />
                    </div>
                  </div>
                </div>
              ))}
              {boards.length === 0 ? (
                <h1 className="text-gray-700">
                  No Boards created yet. Why don&apos;t you go ahead and create one?
                </h1>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
};

export default Dashboard;
