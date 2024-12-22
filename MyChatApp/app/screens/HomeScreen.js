import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser, logout, setUserId } from '../../redux/userSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSearchUserVisible, setIsSearchUserVisible] = useState(false);

  // Thêm state quản lý tìm kiếm người dùng
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch user details
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

  const fetchConversations = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.replace('/screens/CheckEmailScreen');
      return;
    }

    const URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/conversations`;
    try {
      const response = await axios.get(URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.data) {
        const formattedConversations = response.data.data.map((conversation) => {
          let userDetails;

          if (conversation.sender.name === user.name) {
            userDetails = conversation.receiver;
          } else {
            userDetails = conversation.sender;
          }

          return {
            ...conversation,
            userDetails,
          };
        });

        setConversations(formattedConversations);
      } else {
        throw new Error('Invalid conversations data from API.');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      Alert.alert('Error', 'Unable to fetch conversations. Please try again later.');
    }
  };

  // Xử lý tìm kiếm người dùng
  const handleSearchUser = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    const URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/search-user`;
    try {
      const response = await axios.post(URL, { search: searchQuery });
      setSearchResults(response.data?.data || []);
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleConversationPress = (conv) => {
    dispatch(setUserId(conv.userDetails._id));
    router.push('/screens/ChatScreen');
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      dispatch(logout());
      await AsyncStorage.clear();
      router.replace('/screens/CheckEmailScreen');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mager</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setIsSearchUserVisible(true)}>
            <Ionicons name="search" size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations */}
      <View style={styles.conversationContainer}>
        {conversations.length === 0 ? (
          <Text style={styles.noConversationText}>No conversations yet.</Text>
        ) : (
          conversations.map((conv) => (
            <TouchableOpacity
              key={conv?._id}
              style={styles.conversationItem}
              onPress={() => handleConversationPress(conv)}
            >
              <Image
                source={{
                  uri: conv.userDetails.profile_pic || 'https://via.placeholder.com/150',
                }}
                style={styles.conversationAvatar}
              />
              <View style={styles.conversationDetails}>
                <Text style={styles.conversationName}>{conv.userDetails.name}</Text>
                <Text style={styles.conversationLastMessage}>
                  {conv.lastMsg?.text.slice(0,35 ) || 'No messages yet.'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Modal for Search User */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSearchUserVisible}
        onRequestClose={() => setIsSearchUserVisible(false)}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsSearchUserVisible(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchUser}
            />
          </View>
          <View style={styles.searchResultsContainer}>
            {searchLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : searchResults.length === 0 ? (
              <Text style={styles.noResultsText}>No users found.</Text>
            ) : (
              searchResults.map((user) => (
                <TouchableOpacity
                  key={user._id}
                  style={styles.userItem}
                  onPress={() => {
                    dispatch(setUserId(user._id)); // Lưu userId vào redux
                    router.push(`/screens/ChatScreen?userId=${user._id}`);
                    setIsSearchUserVisible(false)
                  }}
                >
                  <Image
                    source={{
                      uri: user.profile_pic || 'https://via.placeholder.com/150',
                    }}
                    style={styles.userAvatar}
                  />
                  <Text style={styles.userName}>{user.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </Modal>

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
              source={{ uri: user?.profile_pic || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <Text style={styles.modalTitle}>{user?.user?.name}</Text>
            <Text>Email: {user?.email}</Text>
            <Text>Account Created: {new Date(user?.createdAt).toLocaleDateString()}</Text>

            <Pressable style={[styles.closeButton, { marginTop: 20, backgroundColor: 'blue' }]} onPress={() => setIsModalVisible(false)}>
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
                  style={[styles.closeButton, { backgroundColor: 'red', marginTop:10}]}
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
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  header: {
    height: 70,
    backgroundColor: '#162447',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  headerIcons: { flexDirection: 'row', gap: 15 },
  conversationContainer: { flex: 1, padding: 10 },
  noConversationText: { color: '#E6E6E6', textAlign: 'center', marginTop: 20 },
  conversationItem: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#1F4068',
    borderRadius: 10,
    alignItems: 'center',
  },
  conversationAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  conversationDetails: { flex: 1 },
  conversationName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  conversationLastMessage: { fontSize: 14, color: '#ddd' },
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
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  closeButton: {
    backgroundColor: '#1A1A2E',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 16,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  searchResultsContainer: {
    flex: 1,
    padding: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
  },
});

export default HomeScreen;
