import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import api from '../services/api';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function CheckEmailScreen() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Lưu thông báo lỗi
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false); // Trạng thái cho popup thành công
  const [isErrorModalVisible, setErrorModalVisible] = useState(false); // Trạng thái cho popup lỗi
  const [isLoading, setLoading] = useState(false); // Trạng thái cho loading animation
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true); // Hiển thị loading
    try {
      const response = await api.post('/api/email', { email });
      setLoading(false); // Tắt loading
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        router.push({
          pathname: '/screens/CheckPasswordScreen',
          params: {
            userId: response.data.data._id,
            name: response.data.data.name,
          },
        });
      }, 2000);
    } catch (error) {
      setLoading(false); // Tắt loading
      setErrorMessage(error.response?.data?.message || 'Check Email');
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
          placeholder="Your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
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
          <Text style={styles.modalText}>One more step 🎉</Text>
        </View>
      </Modal>

      {/* Modal hiển thị trạng thái lỗi */}
      <Modal isVisible={isErrorModalVisible} animationIn="zoomIn" animationOut="zoomOut">
        <View style={styles.modalContent}>
          <LottieView
            source={require('../../assets/animations/error.json')} 
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

      {/* Modal hiển thị trạng thái loading */}
      <Modal isVisible={isLoading} animationIn="fadeIn" animationOut="fadeOut">
        <View style={styles.modalContent}>
          <LottieView
            source={require('../../assets/animations/loading.json')} // Thay bằng file loading animation JSON
            autoPlay
            size= ''
            loop={true}
            style={styles.lottie}
          />
          <Text style={styles.modalText}>Please wait...</Text>
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
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
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
