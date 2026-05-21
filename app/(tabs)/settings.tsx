import AboutScreen from '../../src/components/AboutScreen';
import { router } from 'expo-router';

export default function SettingsScreen() {
  return <AboutScreen onClose={() => router.back()} />;
}
