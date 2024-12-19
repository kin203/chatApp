import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { setUser,logout } from '../../redux/userSlice';
import io from 'socket.io-client';
import { useRouter, useLocalSearchParams } from 'expo-router';

const HomeScreen = () => {
  const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const socketRef = useRef(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      dispatch(logout());
      await AsyncStorage.clear();
      router.replace('/screens/CheckEmailScreen');
      setShowLogoutConfirm(false);
      console.log("Logout successful.");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = await AsyncStorage.getItem('token');
    
      if (!token) {
        Alert.alert('Error', 'Token not found. Redirecting to login.');
        router.replace('/screens/CheckEmailScreen');
        return;
      }
    
      const URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user-details`;
      try {
        const response = await axios.get(URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        if (response.data?.data) {
          // Đảm bảo Redux cập nhật đúng dữ liệu
          dispatch(setUser(response.data.data));
        } else {
          throw new Error('Invalid user data from API.');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        if (error.response?.status === 401) {
          Alert.alert('Session expired', 'Please log in again.');
          dispatch(logout());
          router.replace('/screens/CheckEmailScreen');
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
        router.replace('/screens/CheckEmailScreen');
        return;
      }

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat App</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setIsSearchVisible(!isSearchVisible)}>
            <Ionicons name="search" size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsModalVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {isSearchVisible && (
        <Pressable style={styles.searchOverlay} onPress={() => setIsSearchVisible(false)}>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search..."
              style={styles.searchInput}
              placeholderTextColor="#aaa"
            />
          </View>
        </Pressable>
      )}

      {/* Welcome Text */}
      <View style={styles.logoContainer}>
        <Text style={styles.welcomeText}>Let’s start chatting with someone!</Text>
      </View>

      {/* Floating Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <Ionicons name="pencil" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal for Account Info */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={{ uri: user?.user?.profile_pic || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <Text style={styles.modalTitle}>{user?.user?.name}</Text>
            <Text>Email: {user?.user?.email}</Text>
            <Text>Account Created: {new Date(user?.user?.createdAt).toLocaleDateString()}</Text>

            <Pressable style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.closeButton, { marginTop: 10, backgroundColor: 'red' }]}
              onPress={() => setShowLogoutConfirm(true)}
            >
              <Text style={styles.closeButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLogoutConfirm}
          onRequestClose={() => setShowLogoutConfirm(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text>Are you sure you want to logout?</Text>

              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <Pressable
                  style={[styles.closeButton, { marginRight: 10 }]}
                  onPress={() => setShowLogoutConfirm(false)}
                >
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.closeButton, { backgroundColor: 'red' }]}
                  onPress={handleLogout}
                >
                  <Text style={styles.closeButtonText}>Logout</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    height: 70,
    backgroundColor: '#162447',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Roboto',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    width: '90%',
    padding: 10,
    backgroundColor: '#1F4068',
    borderRadius: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E6E6E6',
    fontFamily: 'Roboto',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1F4068',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1F4068',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});

export default HomeScreen;
