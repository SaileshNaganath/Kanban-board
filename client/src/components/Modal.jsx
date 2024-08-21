
import Modal from "react-modal";
import { Cross } from "./Icons";

const CustomModal = ({ modal, setModal, children, ariaText }) => {
  // Set the app element for accessibility
  Modal.setAppElement("#root");

  return (
    <Modal
      isOpen={modal}
      onRequestClose={() => setModal(false)}
      contentLabel={ariaText}
      className="z-20 fade-in p-6 bg-white rounded-lg shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-10"
    >
      <div className="flex justify-end">
        <div onClick={() => setModal(false)}>
          <div className="p-1.5 hover:bg-red-200 rounded-full text-red-900">
            <Cross />
          </div>
        </div>
      </div>
      {children}
    </Modal>
  );
};

export default CustomModal;
