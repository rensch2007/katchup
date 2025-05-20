import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useTamagotchi } from '../../store/tamagotchiContext';
import { useRoom } from '../../store/roomContext';

const stageImages = {
  seed: require('../../../assets/tamagotchi/seed.png'),
  sprout: require('../../../assets/tamagotchi/sprout.png'),
  tomato: require('../../../assets/tamagotchi/tomato.png'),
  bottle: require('../../../assets/tamagotchi/bottle.png'),
};

type Stage = 'seed' | 'sprout' | 'tomato' | 'bottle';

const getStageImage = (stage: string) => {
  return stageImages[stage as Stage] || stageImages.seed;
};

const POINT_COST = 1;

export default function TamagotchiModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const bounceAnim = useState(new Animated.Value(1))[0];
  const [selected, setSelected] = useState<string | null>(null);
  const { currentRoom } = useRoom();
  const {
    tamagotchi,
    pointsLeft,
    loading,
    fetchTamagotchi,
    interact,
  } = useTamagotchi();

  const roomId = currentRoom?._id;

  const hungerAnim = useRef(new Animated.Value(0)).current;
  const happinessAnim = useRef(new Animated.Value(0)).current;
  const thirstAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && roomId) {
      fetchTamagotchi(roomId);
    }
  }, [visible, roomId]);

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

  useEffect(() => {
    if (tamagotchi) {
      Animated.timing(hungerAnim, {
        toValue: tamagotchi.stats.hunger,
        duration: 500,
        useNativeDriver: false,
      }).start();
      Animated.timing(happinessAnim, {
        toValue: tamagotchi.stats.happiness,
        duration: 500,
        useNativeDriver: false,
      }).start();
      Animated.timing(thirstAnim, {
        toValue: tamagotchi.stats.thirst,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [tamagotchi]);

const handlePress = async (label: string) => {
  if (!roomId) return;
  setSelected(label);
  try {
    await interact(label.toLowerCase() as 'feed' | 'play' | 'water', roomId);

    await fetchTamagotchi(roomId);

    if (Platform.OS === 'android') {
      ToastAndroid?.show(`${label} successful!`, ToastAndroid.SHORT);
    }
  } catch {
    if (Platform.OS === 'android') {
      ToastAndroid?.show('Action failed. Not enough energy?', ToastAndroid.SHORT);
    }
  }
};


  const renderStatBar = (label: string, animValue: Animated.Value, color: string) => (
    <View key={label} style={{ marginBottom: 12, width: '100%' }}>
      <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>{label}</Text>
      <View style={{ height: 14, backgroundColor: '#F3F4F6', borderRadius: 8 }}>
        <Animated.View
          style={{
            width: animValue.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            }),
            height: '100%',
            backgroundColor: color,
            borderRadius: 8,
          }}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View
          style={{
            backgroundColor: '#FFE8EC',
            borderRadius: 24,
            width: '100%',
            height: 500,
            padding: 20,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Pressable
            onPress={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#F87171',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 2,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>×</Text>
          </Pressable>

          {/* Tamagotchi centered */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Text style={{ position: 'absolute', top: 0, fontSize: 14, fontWeight: 'bold' }}>
              {pointsLeft}⚡ energy
            </Text>
            <Animated.Image
              source={getStageImage(tamagotchi?.stage || 'seed')}
              style={{
                width: 100,
                height: 100,
                transform: [{ scale: bounceAnim }],
                marginBottom: 16,
              }}
            />
            <View style={{ width: '100%', paddingHorizontal: 8 }}>
              {renderStatBar('Hunger', hungerAnim, '#F87171')}
              {renderStatBar('Happiness', happinessAnim, '#34D399')}
              {renderStatBar('Thirst', thirstAnim, '#60A5FA')}
            </View>
          </View>

          {/* Button Grid at bottom */}
          <View style={{ width: '100%' }}>
            {[
              ['Feed', 'Play'],
              ['Water', 'Settings'],
            ].map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}
              >
                {row.map((label) => {
                  const isSelected = selected === label;
                  const isDisabled = pointsLeft < POINT_COST || label === 'Settings';
                  return (
                    <Pressable
                      key={label}
                      onPress={() => handlePress(label)}
                      disabled={isDisabled}
                      style={{
                        width: '48%',
                        backgroundColor: isSelected ? '#F87171' : '#FECACA',
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        opacity: isDisabled ? 0.6 : 1,
                      }}
                    >
                      {isSelected && (
                        <Text style={{ marginRight: 4, fontWeight: 'bold' }}>➤</Text>
                      )}
                      <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#000' }}>
                        {label === 'Settings' ? label : `${label} (${POINT_COST}⚡)`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
