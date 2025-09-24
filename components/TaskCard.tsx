
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { Task, User } from '../types';
import Icon from './Icon';
import UserAvatar from './UserAvatar';

interface TaskCardProps {
  task: Task;
  user?: User;
  onComplete?: () => void;
  onPress?: () => void;
  showUser?: boolean;
}

export default function TaskCard({ 
  task, 
  user, 
  onComplete, 
  onPress,
  showUser = true 
}: TaskCardProps) {
  const getStatusColor = (): string => {
    if (task.isCompleted) return colors.success;
    if (task.dueDate < new Date()) return colors.error;
    return colors.warning;
  };

  const getStatusText = (): string => {
    if (task.isCompleted) return 'Completed';
    if (task.dueDate < new Date()) return 'Overdue';
    return 'Pending';
  };

  const getPriorityColor = (): string => {
    switch (task.priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const formatDueDate = (): string => {
    const now = new Date();
    const due = task.dueDate;
    const diffInHours = Math.abs(due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.round(diffInHours * 60);
      return `${minutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h`;
    } else {
      const days = Math.round(diffInHours / 24);
      return `${days}d`;
    }
  };

  const getCategoryIcon = (): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap => {
    switch (task.category) {
      case 'chores': return 'home-outline';
      case 'homework': return 'book-outline';
      case 'personal': return 'person-outline';
      default: return 'list-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[
        commonStyles.card,
        {
          borderLeftWidth: 4,
          borderLeftColor: getStatusColor(),
          opacity: task.isCompleted ? 0.7 : 1,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={commonStyles.spaceBetween}>
        <View style={{ flex: 1 }}>
          <View style={commonStyles.row}>
            <Icon 
              name={getCategoryIcon()} 
              size={16} 
              color={colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <Text style={[
              commonStyles.text,
              { 
                fontWeight: '600',
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                flex: 1,
              }
            ]}>
              {task.title}
            </Text>
          </View>
          
          {task.description && (
            <Text style={[
              commonStyles.textSecondary,
              { 
                marginTop: 4,
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
              }
            ]}>
              {task.description}
            </Text>
          )}

          <View style={[commonStyles.row, { marginTop: 8, flexWrap: 'wrap' }]}>
            {showUser && user && (
              <View style={[commonStyles.row, { marginRight: 12 }]}>
                <UserAvatar user={user} size={20} />
                <Text style={[commonStyles.textSecondary, { marginLeft: 6, fontSize: 12 }]}>
                  {user.name}
                </Text>
              </View>
            )}
            
            <View style={[commonStyles.row, { marginRight: 12 }]}>
              <Icon name="time-outline" size={12} color={getStatusColor()} />
              <Text style={[
                commonStyles.textSecondary,
                { marginLeft: 4, fontSize: 12, color: getStatusColor() }
              ]}>
                {formatDueDate()}
              </Text>
            </View>

            <View style={[commonStyles.row, { marginRight: 12 }]}>
              <Icon name="flag-outline" size={12} color={getPriorityColor()} />
              <Text style={[
                commonStyles.textSecondary,
                { marginLeft: 4, fontSize: 12, color: getPriorityColor() }
              ]}>
                {task.priority}
              </Text>
            </View>

            {task.points && (
              <View style={[commonStyles.row, { marginRight: 12 }]}>
                <Icon name="star-outline" size={12} color={colors.accent} />
                <Text style={[
                  commonStyles.textSecondary,
                  { marginLeft: 4, fontSize: 12, color: colors.accent }
                ]}>
                  {task.points}
                </Text>
              </View>
            )}

            <View style={[
              {
                backgroundColor: getStatusColor(),
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
              }
            ]}>
              <Text style={[
                commonStyles.textSecondary,
                { fontSize: 10, color: colors.backgroundAlt, fontWeight: '600' }
              ]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {!task.isCompleted && onComplete && (
          <TouchableOpacity
            style={{
              backgroundColor: colors.success,
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 12,
            }}
            onPress={onComplete}
          >
            <Icon name="checkmark" size={16} color={colors.backgroundAlt} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
