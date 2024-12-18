import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser, setOnlineUser, setSocketConnection } from '../../redux/userSlice';
import io from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log("Retrieved Token:", token);
      if (!token) {
        console.warn("Token not found, redirecting to CheckEmail...");
        router.replace('/screens/CheckEmailScreen');
        return;
      }
  
      const URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}api/user-details`;
      const response = await axios.get(URL, {
        headers: { Authorization: `Bearer ${token}` }, // Gửi token để xác thực
        withCredentials: true,
      });
  
      dispatch(setUser(response.data.data));
  
      if (response.data.data.logout) {
        await AsyncStorage.removeItem('token');
        dispatch(logout());
        router.replace('/screens/CheckEmailScreen');
      }
    } catch (error) {
      console.error('Fetch User Details Error:', error.response?.data || error.message);
      await AsyncStorage.removeItem('token'); // Xóa token nếu lỗi
      router.replace('/screens/CheckEmailScreen');
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const setupSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const socketConnection = io(process.env.EXPO_PUBLIC_BACKEND_URL, {
        auth: { token },
        withCredentials: true,
      });

      socketConnection.on('connect', () => console.log('Socket connected:', socketConnection.id));
      socketConnection.on('onlineUser', (data) => dispatch(setOnlineUser(data)));

      dispatch(setSocketConnection(socketConnection));

      return () => socketConnection.disconnect();
    };

    setupSocket();
  }, [dispatch]);

  return (
    <View style={styles.container}>
      {!user._id ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : (
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://c.tenor.com/kxZgL7zPf0EAAAAC/tenor.gif' }}
              style={styles.image}
            />
            <Text style={styles.infoText}>Let's start chatting with someone</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#f9f9f9', padding: 20 },
  content: { alignItems: 'center' },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  imageContainer: { marginTop: 20, alignItems: 'center' },
  image: { width: 200, height: 200 },
  infoText: { fontSize: 16, marginTop: 10, color: '#888' },
});
