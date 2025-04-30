import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRoom } from '../../store/roomContext';
import { Notification } from '../../store/notificationContext';

type InvitationItemProps = {
  notification: Notification;
  onAccept: () => void;
  onDecline: () => void;
};

const InvitationItem: React.FC<InvitationItemProps> = ({
  notification,
  onAccept,
  onDecline,
}) => {
  const { acceptInvitation, declineInvitation } = useRoom();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleAccept = async () => {
    if (!notification.roomId) return;
    
    setIsAccepting(true);
    
    try {
      const result = await acceptInvitation(notification.roomId);
      if (result) {
        onAccept();
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!notification.roomId) return;
    
    setIsDeclining(true);
    
    try {
      const result = await declineInvitation(notification.roomId);
      if (result) {
        onDecline();
      }
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-3">
      <Text className="text-gray-800 mb-3">{notification.message}</Text>
      
      <View className="flex-row justify-end space-x-3">
        <Pressable
          onPress={handleDecline}
          disabled={isDeclining || isAccepting}
          className={`px-4 py-2 rounded-lg bg-gray-200 ${
            isDeclining || isAccepting ? 'opacity-50' : ''
          }`}
        >
          {isDeclining ? (
            <ActivityIndicator size="small" color="#4b5563" />
          ) : (
            <Text className="text-gray-700">Decline</Text>
          )}
        </Pressable>
        
        <Pressable
          onPress={handleAccept}
          disabled={isAccepting || isDeclining}
          className={`px-4 py-2 rounded-lg bg-red-500 ${
            isAccepting || isDeclining ? 'opacity-50' : ''
          }`}
        >
          {isAccepting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white">Accept</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default InvitationItem;