import React, { useEffect, useState } from 'react';
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import Avatar from './Avatar';
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetail';
import Divider from './Divider';
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from './SearchUser';
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import { logout } from '../redux/userSlice';
import { IoSettingsSharp } from "react-icons/io5";
import logo from '../assets/logo.png';
import Setting from './Setting';

const Sidebar = () => {
    const user = useSelector((state) => state?.user);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [allUser, setAllUser] = useState([]);
    const [openSearchUser, setOpenSearchUser] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const socketConnection = useSelector((state) => state?.user?.socketConnection);
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    useEffect(() => {
      if (socketConnection) {
        socketConnection.emit("sidebar", user._id);
  
        socketConnection.on("conversation", (data) => {
          const conversationUserData = data.map((conversationUser) => {
            if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
              return {
                ...conversationUser,
                userDetails: conversationUser?.sender,
              };
            } else if (conversationUser?.receiver?._id !== user?._id) {
              return {
                ...conversationUser,
                userDetails: conversationUser.receiver,
              };
            } else {
              return {
                ...conversationUser,
                userDetails: conversationUser.sender,
              };
            }
          });
  
          setAllUser(conversationUserData);
        });
      }
    }, [socketConnection, user]);
  
    const handleLogout = () => {
      dispatch(logout());
      navigate("/email");
      localStorage.clear();
      setShowLogoutConfirm(false);
    };

    const handleCancelLogout = () => {
      setShowLogoutConfirm(false); 
    };

    return (
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-15 bg-white shadow-md flex flex-col items-center py-5">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex justify-center items-center text-white">
              <IoChatbubbleEllipses size={20} />
            </div>
          </div>
  
          {/* Navigation */}
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <NavLink
                to="/chat"
                className={({ isActive }) =>
                `w-12 h-12 flex justify-center items-center rounded-lg cursor-pointer ${
                    isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100 text-gray-500"
                }`
                }
                title="Chat"
            >
                <IoChatbubbleEllipses size={24} />
            </NavLink>

            <button
                onClick={() => setOpenSearchUser(true)}
                className="w-12 h-12 flex justify-center items-center rounded-lg hover:bg-blue-100 text-gray-500"
                title="Add Friend"
            >
                <FaUserPlus size={24} />
            </button>

            <button
                className="w-12 h-12 flex justify-center items-center rounded-lg hover:bg-blue-100 text-gray-500"
                title="Settings"
            >
                <IoSettingsSharp size={24} />
            </button>
           </div>
  
          {/* User Actions */}
          <div className="space-y-4 flex flex-col items-center">
            <button
              onClick={() => setEditUserOpen(true)}
              className="w-12 h-12 rounded-full overflow-hidden flex justify-center items-center"
              title={user?.name}
            >
              <Avatar
                width={40}
                height={40}
                name={user?.name}
                imageUrl={user?.profile_pic}
              />
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)} 
              className="w-12 h-12 flex justify-center items-center rounded-lg hover:bg-blue-100 text-gray-500"
              title="Logout"
            >
              <BiLogOut size={24} />
            </button>
          </div>
        </div>
  
        {/* Main Content */}
        <div className="flex-1 bg-white">
          <div className="h-16 flex items-center px-4 border-y">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-65px)] p-4">
            {allUser.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 mt-16">
                <FiArrowUpLeft size={50} />
                <p className="text-lg">Explore users to start a conversation with.</p>
              </div>
            ) : (
              allUser.map((conv) => (
                <NavLink
                  to={`/${conv?.userDetails?._id}`}
                  key={conv?._id}
                  className="flex items-center p-4 bg-green-200 rounded-lg shadow-sm mb-4 hover:shadow-md transition"
                >
                  <Avatar
                    imageUrl={conv?.userDetails?.profile_pic}
                    name={conv?.userDetails?.name}
                    width={48}
                    height={48}
                  />
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {conv?.userDetails?.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {conv?.lastMsg?.text
                        ? conv.lastMsg.text.length > 15
                          ? `${conv.lastMsg.text.slice(0, 15)}...`
                          : conv.lastMsg.text
                        : "No messages yet."}
                    </p>
                  </div>
                  {Boolean(conv?.unseenMsg) && (
                    <span className="ml-auto text-xs w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full">
                      {conv?.unseenMsg}
                    </span>
                  )}
                </NavLink>
              ))
            )}
          </div>
        </div>

        {editUserOpen && (
          <EditUserDetails
            onClose={() => setEditUserOpen(false)}
            user={user} 
          />
        )}
        {openSearchUser && <SearchUser onClose={() => setOpenSearchUser(false)} />}

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300 ease-in-out">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full transform scale-95 transition-transform duration-300 ease-in-out">
              <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">Are you sure you want to logout?</h3>
              <div className="flex justify-around space-x-4">
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg w-full hover:bg-red-600 focus:outline-none transform transition duration-200 ease-in-out hover:scale-105"
                >
                  Logout
                </button>
                <button
                  onClick={handleCancelLogout}
                  className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg w-full hover:bg-gray-400 focus:outline-none transform transition duration-200 ease-in-out hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
};

export default Sidebar;
