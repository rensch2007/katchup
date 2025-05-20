import React, { createContext, useContext, useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import { useAuth } from './authContext';

export type TamagotchiStats = {
  hunger: number;
  happiness: number;
  thirst: number;
};

export type Tamagotchi = {
  stage: 'seed' | 'sprout' | 'tomato' | 'bottle';
  character: string;
  stats: TamagotchiStats;
  daysSurvived: number;
  deathCount: number;
  evolutionStreak: number;
};

type TamagotchiContextType = {
  tamagotchi: Tamagotchi | null;
  loading: boolean;
  error: string | null;
  fetchTamagotchi: (roomId: string) => Promise<void>;
  interact: (type: 'feed' | 'play' | 'water', roomId: string) => Promise<void>;
  pointsLeft: number;
};

const TamagotchiContext = createContext<TamagotchiContextType | undefined>(undefined);

export const TamagotchiProvider = ({ children }: { children: React.ReactNode }) => {
  const [tamagotchi, setTamagotchi] = useState<Tamagotchi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pointsLeft, setPointsLeft] = useState<number>(0);
  const { token } = useAuth(); 
    const API_URL = BASE_URL;
const fetchTamagotchi = async (roomId: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log('[fetchTamagotchi] Raw response:', data);

      if (data?.data?.tamagotchi) {
        setTamagotchi(data.data.tamagotchi);
        setPointsLeft(data.data.katchupPoints ?? 0);
      } else {
        throw new Error('Tamagotchi not found in room');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('[fetchTamagotchi ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };


  const interact = async (type: 'feed' | 'play' | 'water', roomId: string) => {
    try {
      const res = await fetch(`${API_URL}/tamagotchi/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const updatedStat = data.newStatValue;
      const updatedPoints = data.pointsLeft;

      setPointsLeft(updatedPoints);

      if (tamagotchi) {
        const updatedStats = {
          ...tamagotchi.stats,
          [type === 'feed'
            ? 'hunger'
            : type === 'play'
            ? 'happiness'
            : 'thirst']: updatedStat,
        };

        setTamagotchi({ ...tamagotchi, stats: updatedStats });
      }
    } catch (err: any) {
      setError(err.message);
      console.error(`[${type.toUpperCase()} ERROR]:`, err);
    }
  };

  return (
    <TamagotchiContext.Provider
      value={{ tamagotchi, loading, error, fetchTamagotchi, interact, pointsLeft }}
    >
      {children}
    </TamagotchiContext.Provider>
  );
};

export const useTamagotchi = () => {
  const ctx = useContext(TamagotchiContext);
  if (!ctx) throw new Error('useTamagotchi must be used within a TamagotchiProvider');
  return ctx;
};