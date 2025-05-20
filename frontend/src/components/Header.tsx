import { View, Text, Pressable } from 'react-native';
import { Menu, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/store/authContext'
export default function Header({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const router = useRouter();
const { defaultRoom } = useAuth();
  return (
    <View className="flex-row justify-between items-center px-4 py-3">
      <Text className="text-xl font-bold text-red-500" onPress={() => router.push(`/room/${defaultRoom}`)}>Katchup</Text>
      <View className="flex-row space-x-6 items-center">
        <View style={{ width: 8 }} />
        <Pressable onPress={onOpenSidebar}>
          <Menu color={'#000000'} size={24} />
        </Pressable>
      </View>
    </View>
  );
}