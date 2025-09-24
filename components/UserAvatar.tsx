
import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../styles/commonStyles';
import { User } from '../types';

interface UserAvatarProps {
  user: User;
  size?: number;
}

export default function UserAvatar({ user, size = 40 }: UserAvatarProps) {
  const getInitials = (name: string): string => {
    try {
      if (!name || typeof name !== 'string') {
        return '?';
      }
      
      const trimmedName = name.trim();
      if (!trimmedName) {
        return '?';
      }

      const words = trimmedName.split(' ').filter(word => word.length > 0);
      if (words.length === 0) {
        return '?';
      }

      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
      }

      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    } catch (error) {
      console.error('Error getting initials:', error);
      return '?';
    }
  };

  // Validate user prop
  if (!user || !user.name) {
    console.log('UserAvatar: Invalid user prop provided');
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.textSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: colors.backgroundAlt,
            fontSize: size * 0.4,
            fontWeight: '600',
          }}
        >
          ?
        </Text>
      </View>
    );
  }

  const backgroundColor = user.color || colors.primary;
  const initials = getInitials(user.name);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          color: colors.backgroundAlt,
          fontSize: size * 0.4,
          fontWeight: '600',
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
