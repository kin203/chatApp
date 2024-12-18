import { useRouter } from 'expo-router';
import { View, Button, Text, StyleSheet } from 'react-native';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MyChatApp</Text>
      <Button title="Go to Login" onPress={() => router.push('/screens/CheckEmailScreen')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});
