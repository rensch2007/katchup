// src/components/SafeMapView/MapView.web.tsx
import { View, Text } from 'react-native';

export const MapView = (props: any) => (
  <View
    style={[
      props.style,
      { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }
    ]}
  >
    <Text className="text-gray-400">📍 Map not available on web</Text>
  </View>
);

export const Marker = () => null;
