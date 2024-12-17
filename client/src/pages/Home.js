import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout,setUser,setOnlineUser,setSocketConnection } from '../redux/userSlice'
import Sidebar from '../components/Sidebar'
import logo from '../assets/logo.png'
import io from 'socket.io-client'

const Home = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate =useNavigate()
  const location= useLocation()

  const fetchUserDetails = async () => {
    try {
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
      console.log("Fetching user details from:", URL); // Log URL để kiểm tra
  
      const response = await axios.get(URL, {
        withCredentials: true, // Gửi cookie cùng request
      });
  
      console.log("User Details Response:", response); // Log toàn bộ response
      dispatch(setUser(response.data.data));
  
      if (response.data.data.logout) {
        dispatch(logout());
        navigate('/email');
      }
    } catch (error) {
      console.error("Fetch User Details Error:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log("Token invalid or expired. Logging out...");
        dispatch(logout());
        navigate('/email'); // Chuyển hướng đến trang login
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      console.warn("No token found. Redirecting to login.");
      navigate('/email');
      return;
    }
  
    const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
      auth: {
        token: token, // Gửi token để xác thực với Socket.IO server
      },
      withCredentials: true, // Đảm bảo credentials được gửi
    });
  
    socketConnection.on('connect', () => {
      console.log("Socket connected:", socketConnection.id);
    });
  
    socketConnection.on('onlineUser', (data) => {
      console.log("Online users:", data);
      dispatch(setOnlineUser(data));
    });
  
    socketConnection.on('connect_error', (err) => {
      console.error("Socket connection error:", err.message);
    });
  
    dispatch(setSocketConnection(socketConnection));
  
    return () => {
      socketConnection.disconnect();
      console.log("Socket disconnected");
    };
  }, [navigate, dispatch]);

  // Kiểm tra token trong localStorage trước khi gọi fetchUserDetails
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      // Nếu không có token, chuyển hướng ngay lập tức đến trang đăng nhập
      navigate('/email')
    } else {
      // Nếu có token, gọi API để lấy thông tin người dùng
      fetchUserDetails()
    }
  }, [navigate])

  const basePath = location.pathname == '/'
  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar/>
      </section>

      <section className={`${basePath && "hidden"}`}>
        <Outlet/>
      </section>

      <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex" }`}>
        <div>
          <img
            width={250}
            alt='logo'
            src='https://c.tenor.com/kxZgL7zPf0EAAAAC/tenor.gif'
          />
        </div>
        <p className='text-lg mt-2 text-slate-500'>Let's start chatting with someone </p>
      </div>
    </div>
  )
}

export default Home
