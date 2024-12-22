import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useChatSocket = (userId, userToken) => {
  const [messages, setMessages] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId || !userToken) return;

    // Kết nối với WebSocket server qua socket.io-client
    const socket = io(process.env.EXPO_PUBLIC_BACKEND_URL, {
      query: { userId },
      auth: { token: userToken },
      transports: ['websocket'], // Cố gắng chỉ sử dụng WebSocket
    });
    socketRef.current = socket;

    // Gửi sự kiện để lấy thông tin người dùng và lịch sử tin nhắn
    socket.emit('message-page', userId);

    // Lắng nghe thông tin người dùng
    socket.on('message-user', (data) => setUserDetails(data));

    // Lắng nghe danh sách tin nhắn
    socket.on('message', (data) => {
      if (Array.isArray(data)) {
        setMessages(data); // Cập nhật tin nhắn lịch sử
      } else {
        setMessages((prevMessages) => [data, ...prevMessages]); // Thêm tin nhắn mới
      }
    });

    // Lắng nghe trạng thái trực tuyến
    socket.on('user-status', (status) => {
      console.log('Received user status:', status); // Thêm log để kiểm tra trạng thái
      setIsUserOnline(status.online);
    });

    // Thêm sự kiện lắng nghe khi tin nhắn đã gửi thành công
    // socket.on('message-sent', (message) => {
    //   console.log('Message sent successfully:', message);
    // });

    return () => {
      socket.disconnect();
      socket.off('message');
      socket.off('message-user');
      socket.off('user-status');
      // socket.off('message-sent');
    };
  }, [userId, userToken]);

  const sendMessage = (message) => {
    if (!socketRef.current) return;

    socketRef.current.emit('new message', message);
  };

  return { messages, userDetails, isUserOnline, sendMessage };
};

export default useChatSocket;
