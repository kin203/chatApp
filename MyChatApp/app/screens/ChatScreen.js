import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import moment from 'moment';
import useChatSocket from '../../hooks/useChatSocket';
import { Video } from 'expo-av';  // Import Video từ expo-av

const ChatScreen = () => {
  const userId = useSelector((state) => state.user.userId);
  const userToken = useSelector((state) => state.user.token);
  const user = useSelector((state) => state?.user?.user);

  const { messages, userDetails, isUserOnline, sendMessage } = useChatSocket(userId, userToken);

  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSendMessage = () => {
    if(!message.trim() && !imageUrl) return;

    setLoading(true);
    sendMessage({
      sender: user?._id,
      receiver: userId,
      text: message.trim(),
      imageUrl: imageUrl,
      videoUrl: videoUrl,
      msgByUserId: user?._id,
    });
    setMessage('');
    setImageUrl('');
    setVideoUrl('');
    setLoading(false);
    console.log('Message sent:', message);
  };

  const sortedMessages = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.msgByUserId === user._id ? styles.messageSent : styles.messageReceived,
      ]}
    >
      {item.msgByUserId !== user?._id && (
        <Image
          source={{
            uri: userDetails.profile_pic || 'https://via.placeholder.com/100',
          }}
          alt="Avatar"
          style={styles.avatar}
        />
      )}
      <View
        style={[
          styles.messageBubble,
          item.msgByUserId === user._id ? styles.messageSentBubble : styles.messageReceivedBubble,
        ]}
      >
        {item.text && <Text style={styles.messageText}>{item.text}</Text>}
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
        )}
        {item.videoUrl && (
          <Video
            source={{ uri: item.videoUrl }}  // Sử dụng Video từ expo-av
            useNativeControls
            resizeMode="contain"
            style={styles.messageVideo}
          />
        )}
        <Text style={styles.messageTime}>
          {moment(item.createdAt).format('hh:mm A')}
          {item.seen && <Ionicons name="checkmark-done" size={12} color="blue" />}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={25} color="black"  />
        </TouchableOpacity>
        {userDetails?.profile_pic && (
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userDetails?.profile_pic || `https://via.placeholder.com/40` }} style={styles.avatarHeader} />
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isUserOnline ? 'green' : 'gray' },
              ]}
            />
          </View>
        )}
        <Text style={styles.headerTitle}>{userDetails?.name}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={sortedMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id.toString()}
          inverted
          style={styles.messagesContainer}
        />
      )}

      <View style={styles.inputContainer}>
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.previewImage} />}
        {videoUrl && <Image source={{ uri: videoUrl }} style={styles.previewVideo} />}
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <Ionicons name="send" size={24} color={loading ? 'gray' : 'blue'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderColor: '##F9F9F9',
    borderBottomWidth: 5,
    backgroundColor: 'red',
    borderBottomColor: '#ddd',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
    textAlign: 'center',
  },
  avatar: { width: 30, height: 30, borderRadius: 20, marginLeft: 1, marginRight: 10 },
  avatarHeader: { width: 40, height: 40, borderRadius: 20, marginLeft: 1, marginRight: 10 },
  messagesContainer: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  messageContainer: { marginVertical: 5, flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 10 },
  messageSent: { justifyContent: 'flex-end' },
  messageReceived: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 10, position: 'static' },
  messageSentBubble: { backgroundColor: '#d1e7ff', marginLeft: 'auto' },  // Màu nền tin nhắn gửi đi
  messageReceivedBubble: { backgroundColor: '#f1f0f0', marginRight: 'auto' },  // Màu nền tin nhắn nhận được
  messageText: { fontSize: 13, left: 5, },
  messageImage: { width: 190, height: 190, borderRadius: 10, marginVertical: 5 },
  messageVideo: { width: 190, height: 190, borderRadius: 10, marginVertical: 5 },
  messageTime: {
    fontSize: 9,
    color: '#888',
    position: 'fixed',
    bottom: -5,
    right: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    height: 45,
    marginRight: 10,
  },
  previewImage: { width: 50, height: 50, margin: 5 },
  previewVideo: { width: 50, height: 50, margin: 5 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatarContainer: {
    position: 'relative', // để định vị chấm trạng thái so với avatar
  },
  avatarHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,  // Đặt chấm ở dưới, gần góc phải
    right: -2,   // Đặt chấm ở góc phải
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default ChatScreen;
