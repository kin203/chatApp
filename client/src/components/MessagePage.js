import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { HiDotsVertical } from 'react-icons/hi';
import { IoMdSend, IoMdClose } from "react-icons/io";
import { FaAngleLeft, FaImage, FaVideo, FaPhone } from 'react-icons/fa6';
import Avatar from './Avatar';
import moment from 'moment';
import uploadFile from '../helpers/uploadFile';
import styles from './MessagePage.module.css';
import VideoPlayer from './VideoPlayer';
import Modal from 'react-modal';

const MessagePage = () => {
  const params = useParams();
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesContainerRef = useRef(null);


  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setImageModalOpen] = useState(false);

  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const user = useSelector((state) => state?.user);

  const [dataUser, setDataUser] = useState({
    name: '',
    email: '',
    profile_pic: '',
    online: false,
    _id: '',
  });

  const [message, setMessage] = useState({
    text: '',
    imageUrl: '',
    videoUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const [isUserInfoTabOpen, setUserInfoTabOpen] = useState(false);

  const currentMessage = useRef(null);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };
  
  const closeImageModal = () => {
    setSelectedImage(null);
    setImageModalOpen(false);
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 300; // Kiểm tra cách đáy bao nhiêu px
      setShowScrollToBottom(!isNearBottom);
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Kiểm tra trạng thái ban đầu
    }
    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessage]);

  // Lấy tin nhắn và thông tin người dùng
  useEffect(() => {
    if (socketConnection) {
      // Gửi sự kiện yêu cầu thông tin và tin nhắn
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);

      // Lắng nghe thông tin người dùng
      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });

      // Lắng nghe tin nhắn
      socketConnection.on('message', (data) => {
        if (Array.isArray(data)) {
          setAllMessage(data); // Tin nhắn lịch sử
        } else {
          setAllMessage((prevMessages) => [...prevMessages, data]); // Tin nhắn mới
        }
      });

      // Lắng nghe danh sách hội thoại
      socketConnection.on('conversation', (conversations) => {
        // Cập nhật danh sách hội thoại nếu cần
        console.log('Updated conversations:', conversations);
      });
    }

    return () => {
      if (socketConnection) {
        socketConnection.off('message');
        socketConnection.off('message-user');
        socketConnection.off('conversation');
      }
    };
  }, [socketConnection, params.userId]);

  // Xử lý nhập tin nhắn
  const handleOnChange = (e) => {
    setMessage((prev) => ({ ...prev, text: e.target.value }));
  };

  // Gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((message.text || message.imageUrl || message.videoUrl) && !loading) {
      socketConnection.emit('new message', {
        sender: user?._id,
        receiver: params.userId,
        text: message.text,
        imageUrl: message.imageUrl,
        videoUrl: message.videoUrl,
        msgByUserId: user?._id,
      });
      setMessage({
        text: '',
        imageUrl: '',
        videoUrl: '',
      });
    }
  };

  // Xử lý tải tệp (hình ảnh hoặc video)
  const handleUploadFile = async (file, type) => {
    if (!file || (type === 'image' && !file.type.startsWith("image/")) || (type === 'video' && !file.type.startsWith("video/"))) {
      alert(`Chỉ được chọn ${type === 'image' ? 'hình ảnh' : 'video'}!`);
      return;
    }
    setLoading(true);
    try {
      const uploadedFile = await uploadFile(file);
      if (type === 'image') {
        setMessage((prev) => ({ ...prev, imageUrl: uploadedFile.url }));
      } else {
        setMessage((prev) => ({ ...prev, videoUrl: uploadedFile.url }));
      }
    } catch (error) {
      alert(`Có lỗi xảy ra khi upload ${type === 'image' ? 'hình ảnh' : 'video'}!`);
    } finally {
      setLoading(false);
    }
  };

  // Xóa cuộc hội thoại
  const handleDeleteConversation = () => {
    socketConnection.emit('delete-conversation', { recipientId: params.userId }, (response) => {
      if (response.success) {
        alert('Cuộc hội thoại đã được xóa.');
        setAllMessage([]); // Xóa tin nhắn hiển thị trên giao diện
        setUserInfoTabOpen(false); // Đóng tab thông tin người dùng

        // Tải lại danh sách hội thoại
        socketConnection.emit('sidebar', user._id);
      } else {
        alert(response.message || 'Đã xảy ra lỗi khi xóa cuộc hội thoại.');
      }
    });
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = (e.clipboardData || window.clipboardData).items;
  
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleUploadFile(file, 'image'); // Gọi hàm upload file với file từ clipboard
          }
        }
      }
    };
  
    window.addEventListener('paste', handlePaste);
  
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    <div className={`flex flex-col h-screen ${styles['full-background']}`}>
      {/* Modal xem ảnh */}
      <Modal
        isOpen={isImageModalOpen}
        onRequestClose={closeImageModal}
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
        {selectedImage && (
          <div className="flex justify-center items-center relative">
            <img
              src={selectedImage}
              alt="Xem ảnh"
              className="max-w-full max-h-screen rounded-lg shadow-lg"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-400"
            >
              &times;
            </button>
          </div>
        )}
      </Modal>
      
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-1.5 shadow">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-500">
            <FaAngleLeft size={24} />
          </Link>
          <Avatar
            width={40}
            height={40}
            imageUrl={dataUser?.profile_pic}
            name={dataUser?.name}
            userId={dataUser?._id}
          />
          <div>
            <h3 className="text-lg font-semibold">{dataUser?.name}</h3>
            <span
              className={`text-sm ${dataUser.online ? 'text-green-500' : 'text-gray-500'}`}
            >
              {dataUser.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút gọi điện */}
          <button >
            <FaPhone size={24} className="text-green-500 cursor-pointer" />
          </button>
          <HiDotsVertical
            size={24}
            className="text-gray-500 cursor-pointer"
            onClick={() => setUserInfoTabOpen(!isUserInfoTabOpen)}
          />
        </div>
      </header>

      {/* Messages */}
      <section
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-6">
          {allMessage.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${user._id === msg?.msgByUserId ? 'justify-end' : 'justify-start'}`}
            >
              {user._id !== msg?.msgByUserId && (
                <img
                  src={dataUser?.profile_pic || 'https://via.placeholder.com/40'}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full mr-3"
                />
              )}
              <div
                className={`p-2 rounded-lg w-fit max-w-sm shadow ${
                  user._id === msg?.msgByUserId ? 'ml-auto bg-teal-100' : 'bg-white'
                }`}
              >
                {msg?.videoUrl && (
                  <div className="w-full">
                    <VideoPlayer src={msg.videoUrl} />
                  </div>
                )}
                {msg?.imageUrl && (
                  <button onClick={() => openImageModal(msg.imageUrl)}>
                    <img
                      src={msg.imageUrl}
                      alt="attachment"
                      className="w-full h-full object-scale-down rounded cursor-pointer"
                    />
                  </button>
                )}
                <p className="px-2 text-sm">{msg.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {moment(msg.createdAt).format('hh:mm A')}
                </p>
              </div>;

            </div>
          ))}
          <div ref={currentMessage} />
        </div>
        {showScrollToBottom && (
          <button
            onClick={() => {
              messagesContainerRef.current?.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth',
              });
            }}
            className="fixed bottom-16 right-1/2 translate-x-1/2 p-2 bg-white text-slate-500 rounded-full shadow-md hover:bg-slate-200"
            style={{ width:40, height:40  }}
          >
            ↓
          </button>
        )}
      </section>

      {/* Input Section */}
      <section className="flex flex-col px-4 py-3 gap-3">
        {/* Preview Section */}
        {(message.imageUrl || message.videoUrl) && (
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
            {message.imageUrl && <img src={message.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />}
            {message.videoUrl && <video src={message.videoUrl} className="w-16 h-16 object-cover rounded" controls />}
            <button
              onClick={() => setMessage((prev) => ({ ...prev, imageUrl: '', videoUrl: '' }))}
              className="text-red-500 hover:text-red-600"
            >
              <IoMdClose size={20} />
            </button>
          </div>
        )}

        {/* Input Box */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => document.getElementById('uploadImage').click()}
            className="w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-400 flex items-center justify-center"
            disabled={loading}
          >
            <FaImage size={18} className="text-blue-500" />
          </button>
          <button
            onClick={() => document.getElementById('uploadVideo').click()}
            className="w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-400 flex items-center justify-center"
            disabled={loading}
          >
            <FaVideo size={18} className="text-purple-500" />
          </button>
          <input
            type="file"
            id="uploadImage"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUploadFile(e.target.files[0], 'image')}
          />
          <input
            type="file"
            id="uploadVideo"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleUploadFile(e.target.files[0], 'video')}
          />
          <form className="flex-1 flex items-center gap-3" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Write Something..."
              className="flex-1 px-4 py-2 rounded-full bg-gray-100 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={message.text}
              onChange={handleOnChange}
              disabled={loading}
            />
            <button
              type="submit"
              className={`w-10 h-10 rounded-full flex items-center justify-center ${loading ? 'animate-spin' : ''} ${
                message.text || message.imageUrl || message.videoUrl
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={loading || !(message.text || message.imageUrl || message.videoUrl)}
            >
              <IoMdSend size={20} />
            </button>
          </form>
        </div>
      </section>

      {/* Conversation Info  */}
      {isUserInfoTabOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0"
            onClick={() => setUserInfoTabOpen(false)} 
          ></div>
          
          <div
            className={`fixed top-12 right-4 h-100 w-80 bg-white shadow rounded-xl border-spacing-2 overflow-y-auto slide-in`}
          >
            <div className="flex flex-col items-center p-10 mt-5">
              <img
                src={dataUser?.profile_pic || 'https://via.placeholder.com/100'}
                alt="User Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <h3 className="text-lg font-semibold mt-4">{dataUser?.name}</h3>
              <span
                className={`text-sm ${dataUser.online ? 'text-green-500' : 'text-gray-500'}`}
              >
                {dataUser.online ? '● Online' : 'Offline'}
              </span>
            </div>
            <div className="p-4">
              <h4 className="text-md font-bold mb-2">Media</h4>
              <div className="grid grid-cols-3 gap-2">
                {allMessage
                  .filter((msg) => msg.imageUrl || msg.videoUrl)
                  .map((msg, index) => (
                    <div key={index} className="w-full h-24 relative">
                      {msg.imageUrl ? (
                        <img src={msg.imageUrl} alt="Sent Image" className="w-full h-full object-cover rounded" />
                      ) : (
                        <video src={msg.videoUrl} className="w-full h-full object-cover rounded" controls />
                      )}
                    </div>
                  ))}
              </div>
              <button
                onClick={handleDeleteConversation}
                className="w-full bg-red-500 text-white py-2 mt-4 rounded-lg hover:bg-red-600"
              >
                Xóa cuộc hội thoại
              </button>
            </div>;
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
