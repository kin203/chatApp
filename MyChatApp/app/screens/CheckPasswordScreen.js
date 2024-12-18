import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setToken } from '../../redux/userSlice';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckPasswordScreen() {
  const [password, setPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Lấy params từ navigation
  const { userId, name } = useLocalSearchParams();

  // Điều hướng về CheckEmail nếu thiếu params
  useEffect(() => {
    if (!userId || !name) {
      router.replace('/screens/CheckEmailScreen');
    }
  }, [userId, name, router]);

  // Xử lý đăng nhập
  const handleSubmit = async () => {
    try {
        const response = await api.post('/api/password', {
          userId: userId, // từ useLocalSearchParams
          password: password,
        });
        console.log("API Response:", response.data);
      
        const token = response.data.token;
        await AsyncStorage.setItem('token', token);
        dispatch(setToken(token));
        Alert.alert('Success', response.data.message);
        router.replace('/screens/HomeScreen');
      } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.message || 'Failed to login');
      }      
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {name || 'User'}!</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 12, marginBottom: 20, borderRadius: 8, backgroundColor: '#fff' },
});
