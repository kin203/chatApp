import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { HiDotsVertical } from 'react-icons/hi';
import { FaAngleLeft, FaImage, FaVideo } from 'react-icons/fa6';
import { IoMdSend, IoMdClose } from "react-icons/io";
import Avatar from './Avatar';
import moment from 'moment';
import uploadFile from '../helpers/uploadFile';
import backgroundImage from '../assets/Desktop.png';
import styles from './MessagePage.module.css';

const MessagePage = () => {
  const params = useParams();
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
  const currentMessage = useRef(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessage]);

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);

      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });

      socketConnection.on('message', (data) => {
        if (!Array.isArray(data)) {
          setAllMessage((prevMessages) => [...prevMessages, data]);
        } else {
          setAllMessage(data);
        }
      });
    }

    return () => {
      if (socketConnection) {
        socketConnection.off('message');
        socketConnection.off('message-user');
      }
    };
  }, [socketConnection, params?.userId]);

  const handleOnChange = (e) => {
    setMessage((prev) => ({ ...prev, text: e.target.value }));
  };

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

  return (
    <div className={`flex flex-col h-screen ${styles['full-background']}`}>
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
              {dataUser.online ? '● Online' : 'Offline'}
            </span>
          </div>
        </div>
        <HiDotsVertical size={24} className="text-gray-500 cursor-pointer" />
      </header>

      {/* Messages */}
      <section className="flex-1 overflow-y-auto px-4 py-4">
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
                className={`p-2 rounded-lg w-fit max-w-sm shadow ${user._id === msg?.msgByUserId ? 'ml-auto bg-teal-100' : 'bg-white'}`}
              >
                {msg?.imageUrl && (
                  <img src={msg?.imageUrl} alt="attachment" className="w-full h-full object-scale-down rounded" />
                )}
                {msg?.videoUrl && (
                  <video src={msg.videoUrl} className="w-full h-full object-scale-down rounded" controls />
                )}
                <p className="px-2 text-sm">{msg.text}</p>
                <p className="text-xs text-gray-500 mt-1">{moment(msg.createdAt).format('hh:mm A')}</p>
              </div>
            </div>
          ))}
          <div ref={currentMessage} />
        </div>
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
    </div>
  );
};

export default MessagePage;
