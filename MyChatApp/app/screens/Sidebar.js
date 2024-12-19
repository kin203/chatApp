import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/userSlice';  // Giả sử bạn có redux store đã setup
import AsyncStorage from '@react-native-async-storage/async-storage';

const Sidebar = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');  // Xoá token khỏi AsyncStorage
    dispatch(logout());  // Gọi action logout
    navigation.navigate('CheckEmail');  // Chuyển hướng đến màn hình CheckEmail
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Sidebar</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.link}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CheckPassword')}>
        <Text style={styles.link}>Check Password</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.link}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  link: {
    fontSize: 18,
    color: 'blue',
    marginBottom: 15,
  },
});

export default Sidebar;
