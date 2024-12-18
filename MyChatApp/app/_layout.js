import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../redux/store'; // Import store Redux của bạn

export default function Layout() {
  return (
    <Provider store={store}>
      <Stack />
    </Provider>
  );
}
