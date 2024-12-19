import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setToken } from '../../redux/userSlice';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckPasswordScreen() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Trạng thái để ẩn/hiện mật khẩu
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false); // Trạng thái cho popup thành công
  const [isErrorModalVisible, setErrorModalVisible] = useState(false); // Trạng thái cho popup lỗi
  const [errorMessage, setErrorMessage] = useState(''); // Lưu thông báo lỗi
  const router = useRouter();
  const dispatch = useDispatch();

  // Lấy params từ navigation
  const { userId, name } = useLocalSearchParams();

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

      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      dispatch(setToken(token));

      setSuccessModalVisible(true);

      setTimeout(() => {
        setSuccessModalVisible(false);
        router.replace('/screens/HomeScreen');
      }, 2000); 
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      setErrorMessage(error.response?.data?.message || 'Failed to login');
      setErrorModalVisible(true); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Mager</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Login to Mager</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Let’s Go!</Text>
        </TouchableOpacity>
      </View>

      {/* Modal hiển thị trạng thái thành công */}
      <Modal isVisible={isSuccessModalVisible} animationIn="zoomIn" animationOut="zoomOut">
        <View style={styles.modalContent}>
          <LottieView
            source={require('../../assets/animations/success.json')} // Thay bằng file animation JSON
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.modalText}>Login Successful!</Text>
        </View>
      </Modal>

      {/* Modal hiển thị trạng thái lỗi */}
      <Modal isVisible={isErrorModalVisible} animationIn="zoomIn" animationOut="zoomOut">
        <View style={styles.modalContent}>
          <LottieView
            source={require('../../assets/animations/error.json')} // Thay bằng file animation lỗi JSON
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => setErrorModalVisible(false)}
          >
            <Text style={styles.errorButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 80 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  card: {
    width: '90%',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    position: 'relative',
  },
  title: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 15 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    top: 75, // Điều chỉnh vị trí icon mắt
    right: 30,
  },
  eyeText: { fontSize: 18 },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 10,
  },
  errorButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  lottie: { width: 100, height: 100 },
});
