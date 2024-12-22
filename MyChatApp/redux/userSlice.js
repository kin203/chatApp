import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null, 
  user: {
    _id: "",
    name: "",
    email: "",
    profile_pic: "",
  },
  onlineUser: [], 
  socketConnection: null, 
  userId: null, // Thêm trường userId
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, name, email, profile_pic, createdAt } = action.payload;
      state.user = { _id, name, email, profile_pic, createdAt };
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload; // Lưu userId
    },
    logout: (state) => {
      if (state.socketConnection && typeof state.socketConnection.disconnect === 'function') {
        state.socketConnection.disconnect();
        console.log("Socket disconnected during logout.");
      }
      state.token = null;
      state.user = { _id: "", name: "", email: "", profile_pic: "" };
      state.onlineUser = [];
      state.socketConnection = null;
      state.userId = null; // Xóa userId khi logout
    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload;
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload;
    },
  },
});

export const { setUser, setToken, logout, setUserId, setOnlineUser, setSocketConnection } = userSlice.actions;

export default userSlice.reducer;
