import Modal from 'react-modal';

const ImageModal = ({ isOpen, imageUrl, onClose }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onClose}
    contentLabel="Xem ảnh"
    style={{
      overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 50 },
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        background: 'transparent',
        border: 'none',
        padding: 0,
      },
    }}
  >
    {imageUrl && (
      <div className="flex justify-center items-center relative">
        <img src={imageUrl} alt="Xem ảnh" className="max-w-full max-h-screen rounded-lg shadow-lg" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-400"
        >
          &times;
        </button>
      </div>
    )}
  </Modal>
);

export default ImageModal;
