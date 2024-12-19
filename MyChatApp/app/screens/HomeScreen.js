import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setOnlineUser, setSocketConnection, logout } from '../../redux/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import io from 'socket.io-client';

const HomeScreen = () => {
  const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const navigation = useNavigation(); // hook để lấy navigation
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);  // sử dụng useRef để giữ socket instance

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      console.log('Starting fetchUserDetails');
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
  
      if (!token) {
        Alert.alert('Error', 'Token not found. Redirecting to login.');
        navigation.navigate('Login');
        return;
      }
  
      const URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user-details`;
      try {
        console.log('Fetching data from:', URL);
        const response = await axios.get(URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        dispatch(setUser(response.data.data));
  
        if (response.data.data.logout) {
          dispatch(logout());
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        if (error.response?.status === 401) {
          Alert.alert('Session expired', 'Please log in again.');
          dispatch(logout());
          navigation.navigate('Login');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserDetails();
  }, [dispatch, navigation]);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log("No token found. Redirecting to CheckEmail.");
        navigation.navigate('CheckEmail');
        return;
      }
  
      // Chỉ tạo kết nối nếu chưa có kết nối socket
      if (!socketRef.current) {
        const socketConnection = io(process.env.EXPO_PUBLIC_BACKEND_URL, {
          auth: { token },
          transports: ['websocket'],
          secure: true,
          rejectUnauthorized: false,
        });
  
        socketRef.current = socketConnection;
  
        socketConnection.on('connect', () => {
          console.log('Socket connected:', socketConnection.id);
        });
  
        socketConnection.on('onlineUser', (data) => {
          console.log('Online user data:', data);
          dispatch(setOnlineUser(data));
        });
  
        socketConnection.on('connect_error', (err) => {
          console.error('Socket connection error:', err.message);
        });
  
        dispatch(setSocketConnection({ connected: socketConnection.connected }));
      }
    };
    initializeSocket();
  }, [dispatch, navigation]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>User not found. Please login again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.welcomeText}>Let’s start chatting with someone!</Text>
      </View>
      <View>
        <Text>Welcome {user?.user?.name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  logoContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
