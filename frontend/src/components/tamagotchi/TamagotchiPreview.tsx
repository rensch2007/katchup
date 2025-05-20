import React, { useState, useEffect } from 'react';
import { View, Text, Animated, Pressable, Image } from 'react-native';
import TamagotchiModal from './TamagotchiModal';

type Props = {
  streak: number;
};

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

export default function TamagotchiPreview({ streak }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const bounceAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
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
  }, []);

return (
  <>
    <Pressable onPress={() => setModalVisible(true)} className="items-center justify-center">
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }} className="items-center">
        <Image
          source={getStageImage(streak)}
          style={{ width: 55, height: 55 }}
        />
        <Text className="text-xs text-gray-400">Tap me!</Text>
      </Animated.View>
    </Pressable>

    {modalVisible && (
      <TamagotchiModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        streak={streak}
      />
    )}
  </>
);

}
