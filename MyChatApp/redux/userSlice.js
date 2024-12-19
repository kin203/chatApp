import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null, // Token xác thực
  user: {
    _id: "",
    name: "",
    email: "",
    profile_pic: "",
  }, // Thông tin người dùng
  onlineUser: [], // Danh sách người dùng đang online
  socketConnection: null, // Kết nối socket
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, name, email, profile_pic } = action.payload;
      state.user = { _id, name, email, profile_pic }; // Cập nhật thông tin người dùng
    },
    setToken: (state, action) => {
      state.token = action.payload; // Gán token
    },
    logout: (state) => {
      state.token = null; // Xóa token
      state.user = { _id: "", name: "", email: "", profile_pic: "" }; // Xóa thông tin người dùng
      state.onlineUser = []; // Xóa danh sách online
      state.socketConnection = null; // Ngắt kết nối socket
    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload; // Cập nhật danh sách người dùng online
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload; // Cập nhật thông tin kết nối socket
    },
  },
});

export const { setUser, setToken, logout, setOnlineUser, setSocketConnection } = userSlice.actions;

export default userSlice.reducer;
