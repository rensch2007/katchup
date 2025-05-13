import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './authContext';
import { BASE_URL } from '../config';

type Member = {
  user: {
    _id: string;
    username: string;
  } | string;
  role: 'admin' | 'member';
  joinedAt: string;
};

type Invitation = {
  user: {
    _id: string;
    username: string;
  } | string;
  status: 'pending' | 'accepted' | 'declined';
  invitedAt: string;
};

export type Room = {
  _id: string;
  name: string;
  creator: string;
  members: Member[];
  invitations: Invitation[];
  code: string;
  createdAt: string;
  updatedAt: string;
  collectiveStreakCount?: number;
  lastStreakDate?: string;
  streakHistory?: {
    date: string;
    success: boolean;
    userIds: string[];
  }[];
  cutoffHourKST?: number;
};


type RoomContextType = {
  rooms: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  fetchRoom: (roomId: string) => Promise<void>;
  createRoom: (name: string) => Promise<Room | null>;
  inviteUsers: (roomId: string, usernames: string[]) => Promise<{
    invited: string[];
    invalid: { username: string; reason: string }[];
  } | null>;
  joinRoom: (code: string) => Promise<Room | null>;
  acceptInvitation: (roomId: string) => Promise<Room | null>;
  declineInvitation: (roomId: string) => Promise<boolean>;
  clearError: () => void;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

const API_URL = BASE_URL;

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms when token changes or component mounts
  useEffect(() => {
    if (token) {
      fetchRooms();
    } else {
      setRooms([]);
      setCurrentRoom(null);
    }
  }, [token]);

  const fetchRooms = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching all rooms...');
      const response = await fetch(`${API_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Rooms fetch response:', data);

      if (data.success) {
        setRooms(data.data);
      } else {
        setError(data.error || 'Failed to fetch rooms');
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoom = async (roomId: string) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching room ${roomId}...`);
      const response = await fetch(`${API_URL}/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Room fetch response:', data);

      if (data.success) {
        setCurrentRoom(data.data);
      } else {
        setError(data.error || 'Failed to fetch room details');
      }
    } catch (err) {
      console.error('Fetch room error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async (name: string): Promise<Room | null> => {
    if (!token) return null;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating room with name:', name || '[auto-generated]');
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      console.log('Create room response:', data);

      if (data.success) {
        await fetchRooms(); // Refresh room list
        return data.data;
      } else {
        setError(data.error || 'Failed to create room');
        return null;
      }
    } catch (err) {
      console.error('Create room error:', err);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUsers = async (
    roomId: string,
    usernames: string[]
  ): Promise<{
    invited: string[];
    invalid: { username: string; reason: string }[];
  } | null> => {
    if (!token) return null;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Inviting users to room:', roomId, usernames);
      const response = await fetch(`${API_URL}/rooms/${roomId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ usernames }),
      });

      const data = await response.json();
      console.log('Invite users response:', data);

      if (data.success) {
        if (currentRoom && currentRoom._id === roomId) {
          await fetchRoom(roomId); // Refresh current room data
        }
        return data.data;
      } else {
        setError(data.error || 'Failed to invite users');
        return null;
      }
    } catch (err) {
      console.error('Invite users error:', err);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (code: string): Promise<Room | null> => {
    if (!token) return null;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Joining room with code:', code);
      const response = await fetch(`${API_URL}/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      console.log('Join room response:', data);

      if (data.success) {
        await fetchRooms(); // Refresh room list
        return data;
      } else {
        setError(data.error || 'Failed to join room');
        return null;
      }
    } catch (err) {
      console.error('Join room error:', err);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async (roomId: string): Promise<Room | null> => {
    if (!token) return null;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Accepting invitation for room:', roomId);
      const response = await fetch(`${API_URL}/rooms/invitations/${roomId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Accept invitation response:', data);

      if (data.success) {
        await fetchRooms(); // Refresh room list
        return data.data;
      } else {
        setError(data.error || 'Failed to accept invitation');
        return null;
      }
    } catch (err) {
      console.error('Accept invitation error:', err);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const declineInvitation = async (roomId: string): Promise<boolean> => {
    if (!token) return false;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Declining invitation for room:', roomId);
      const response = await fetch(`${API_URL}/rooms/invitations/${roomId}/decline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Decline invitation response:', data);

      if (data.success) {
        return true;
      } else {
        setError(data.error || 'Failed to decline invitation');
        return false;
      }
    } catch (err) {
      console.error('Decline invitation error:', err);
      setError('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        currentRoom,
        isLoading,
        error,
        fetchRooms,
        fetchRoom,
        createRoom,
        inviteUsers,
        joinRoom,
        acceptInvitation,
        declineInvitation,
        clearError,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};