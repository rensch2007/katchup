// components/tamagotchi/TamagotchiModal.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Image,
  Animated,
} from 'react-native';

const stageImages = {
  seed: require('../../../assets/tamagotchi/seed.png'),
  sprout: require('../../../assets/tamagotchi/sprout.png'),
  tomato: require('../../../assets/tamagotchi/tomato.png'),
  bottle: require('../../../assets/tamagotchi/bottle.png'),
};

const getStageImage = (streak: number) => {
  if (streak >= 7) return stageImages.bottle;
  if (streak >= 5) return stageImages.tomato;
  if (streak >= 2) return stageImages.sprout;
  return stageImages.seed;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  streak: number;
};

export default function TamagotchiModal({ visible, onClose, streak }: Props) {
  const bounceAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        {/* Outer shell */}
        <View
          className="items-center justify-start shadow-xl rounded-[40px] p-4"
          style={{
            backgroundColor: '#E6D4F0', // pastel purple
            width: 320,
            height: 480,
            borderWidth: 4,
            borderColor: '#D3BEEA',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Close Button */}
          <Pressable
            onPress={onClose}
            style={{ position: 'absolute', top: 14, right: 14 }}
          >
            <View
              className="w-8 h-8 rounded-full bg-white items-center justify-center shadow"
              style={{ elevation: 4 }}
            >
              <Text className="text-gray-500 text-lg">✕</Text>
            </View>
          </Pressable>

          {/* Top light or speaker dots */}
          <View className="flex-row space-x-1 mt-2 mb-1">
            {[...Array(5)].map((_, i) => (
              <View key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 opacity-30" />
            ))}
          </View>

          {/* Screen area */}
          <View
            className="rounded-xl bg-[#C8D6C2] mt-2 mb-4 items-center justify-center"
            style={{ width: '88%', height: 220, borderWidth: 2, borderColor: '#9BAE94' }}
          >
            <Animated.Image
              source={getStageImage(streak)}
              style={{
                width: 100,
                height: 100,
                transform: [{ scale: bounceAnim }],
              }}
            />
            <Text className="text-sm font-semibold text-gray-700 mt-2">Your Katchup</Text>
          </View>

          {/* Interaction buttons */}
          <View className="flex-row justify-between w-full px-6 mt-2">
            {[
              { label: 'Feed', emoji: '🍽', color: '#FECACA' },
              { label: 'Play', emoji: '🎾', color: '#BFDBFE' },
              { label: 'Water', emoji: '💧', color: '#BBF7D0' },
            ].map((btn, i) => (
              <Pressable
                key={i}
                onPress={() => alert(`${btn.label}ed!`)}
                style={{ backgroundColor: btn.color }}
                className="rounded-full w-16 h-16 items-center justify-center shadow"
              >
                <Text className="text-lg">{btn.emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}