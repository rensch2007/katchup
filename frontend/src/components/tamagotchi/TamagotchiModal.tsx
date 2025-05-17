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

const buttonMatrix = [
  ['Feed', 'Play'],
  ['Water', 'Settings'],
];

export default function TamagotchiModal({ visible, onClose, streak }: Props) {
  const bounceAnim = useState(new Animated.Value(1))[0];
  const [cursor, setCursor] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.1,
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

  const handleDpad = (dir: 'up' | 'down' | 'left' | 'right') => {
    setCursor(([row, col]) => {
      if (dir === 'up') return [Math.max(row - 1, 0), col];
      if (dir === 'down') return [Math.min(row + 1, 1), col];
      if (dir === 'left') return [row, Math.max(col - 1, 0)];
      if (dir === 'right') return [row, Math.min(col + 1, 1)];
      return [row, col];
    });
  };

  const handleSelect = () => {
    const label = buttonMatrix[cursor[0]][cursor[1]];
    alert(`${label} selected!`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{
            width: 320,
            height: 600,
            borderRadius: 32,
            backgroundColor: '#FBCACA',
            padding: 20,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* LCD */}
          <View
            style={{
              backgroundColor: '#D9D9D9',
              borderRadius: 24,
              width: '100%',
              height: 360,
              paddingVertical: 20,
              paddingHorizontal: 16,
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            {/* Character */}
            <View style={{ alignItems: 'center' }}>
              <Animated.Image
                source={getStageImage(streak)}
                style={{
                  width: 100,
                  height: 100,
                  transform: [{ scale: bounceAnim }],
                  marginTop: 50,
                }}
              />
            </View>

            {/* Button Grid - pushed lower */}
            <View style={{ marginTop: 'auto', marginBottom: 8 }}>
              {[0, 1].map((row) => (
                <View key={row} className="flex-row justify-between mb-3">
                  {[0, 1].map((col) => {
                    const label = buttonMatrix[row][col];
                    const selected = cursor[0] === row && cursor[1] === col;
                    return (
                      <View
                        key={label}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '48%',
                        }}
                      >
                        {selected && (
                          <Text
                            style={{
                              marginRight: 8,
                              fontWeight: 'bold',
                              fontSize: 14,
                            }}
                          >
                            ➤
                          </Text>
                        )}
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: selected ? '#F87171' : '#FECACA',
                            paddingVertical: 6,
                            borderRadius: 4,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#000' }}>
                            {label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* Controller */}
          <View
            style={{
              flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    gap: 68,
            }}
          >
            {/* D-pad */}
            <View style={{ width: 72, height: 72, position: 'relative' }}>
              {[
                ['up', { top: 0, left: '50%', transform: [{ translateX: -12 }] }],
                ['down', { bottom: 0, left: '50%', transform: [{ translateX: -12 }] }],
                ['left', { top: '50%', left: 0, transform: [{ translateY: -12 }] }],
                ['right', { top: '50%', right: 0, transform: [{ translateY: -12 }] }],
              ].map(([dir, style]) => (
                <Pressable
                  key={dir}
                  onPress={() => handleDpad(dir as any)}
                  style={{
                    position: 'absolute',
                    width: 24,
                    height: 24,
                    backgroundColor: '#9CA3AF',
                    borderRadius: 2,
                    ...style as any,
                  }}
                />
              ))}
              <View
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 24,
                  height: 24,
                  backgroundColor: '#9CA3AF',
                  transform: [{ translateX: -12 }, { translateY: -12 }],
                  borderRadius: 2,
                }}
              />
            </View>

            {/* A/B Buttons with proper spacing */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={handleSelect}
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: '#9CA3AF',
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: '#4B5563',
                }}
              />
              <Pressable
                onPress={onClose}
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: '#9CA3AF',
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: '#4B5563',
                }}
              />
            </View>
          </View>

          {/* Exit Button */}
          <Pressable onPress={onClose}>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 4,
                backgroundColor: '#F87171',
                borderRadius: 6,
                marginTop: 12,
              }}
            >
              <Text className="text-white text-base">exit</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
