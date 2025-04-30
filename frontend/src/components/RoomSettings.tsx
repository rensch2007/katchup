import { View, Text, Pressable, FlatList, Clipboard } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function RoomSettingsScreen() {
  const roomCode = "ABC1234"; // Replace with actual room code logic later

  const members = ['Jay', 'Friend A', 'Friend B']; // Replace with actual logic
  const pendingInvites = ['invite1@email.com', 'invite2@email.com'];

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-lg font-bold mb-2">Room Code</Text>
      <View className="flex-row items-center justify-between border p-3 rounded mb-4">
        <Text selectable>{roomCode}</Text>
        <Pressable onPress={() => Clipboard.setString(roomCode)}>
          <Text className="text-blue-500">Copy</Text>
        </Pressable>
      </View>

      <Text className="text-lg font-bold mb-2">Members</Text>
      {members.map((m, i) => (
        <Text key={i} className="ml-2 mb-1">- {m}</Text>
      ))}

      <Text className="text-lg font-bold mt-4 mb-2">Pending Invitations</Text>
      {pendingInvites.map((email, i) => (
        <Text key={i} className="ml-2 mb-1">- {email}</Text>
      ))}
    </View>
  );
}