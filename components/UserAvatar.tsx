
import React from 'react';
import { View, Text } from 'react-native';
import { User } from '../types';
import { colors } from '../styles/commonStyles';

interface UserAvatarProps {
  user: User;
  size?: number;
}

export default function UserAvatar({ user, size = 40 }: UserAvatarProps) {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: user.color,
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
        {getInitials(user.name)}
      </Text>
    </View>
  );
}
