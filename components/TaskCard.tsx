
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
    try {
      if (task.isCompleted) return colors.success;
      if (task.dueDate && task.dueDate < new Date()) return colors.error;
      return colors.warning;
    } catch (error) {
      console.error('Error getting task status color:', error);
      return colors.textSecondary;
    }
  };

  const getStatusText = (): string => {
    try {
      if (task.isCompleted) return 'Completed';
      if (task.dueDate && task.dueDate < new Date()) return 'Overdue';
      return 'Pending';
    } catch (error) {
      console.error('Error getting task status text:', error);
      return 'Unknown';
    }
  };

  const getPriorityColor = (): string => {
    try {
      switch (task.priority) {
        case 'high': return colors.error;
        case 'medium': return colors.warning;
        case 'low': return colors.textSecondary;
        default: return colors.textSecondary;
      }
    } catch (error) {
      console.error('Error getting priority color:', error);
      return colors.textSecondary;
    }
  };

  const formatDueDate = (): string => {
    try {
      if (!task.dueDate || !(task.dueDate instanceof Date)) {
        return 'No due date';
      }

      const now = new Date();
      const due = task.dueDate;
      const diffInMs = Math.abs(due.getTime() - now.getTime());
      const diffInHours = diffInMs / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const minutes = Math.round(diffInHours * 60);
        return `${minutes}m`;
      } else if (diffInHours < 24) {
        return `${Math.round(diffInHours)}h`;
      } else {
        const days = Math.round(diffInHours / 24);
        return `${days}d`;
      }
    } catch (error) {
      console.error('Error formatting due date:', error);
      return 'Invalid date';
    }
  };

  const getCategoryIcon = (): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap => {
    try {
      switch (task.category) {
        case 'chores': return 'home-outline';
        case 'homework': return 'book-outline';
        case 'personal': return 'person-outline';
        default: return 'list-outline';
      }
    } catch (error) {
      console.error('Error getting category icon:', error);
      return 'list-outline';
    }
  };

  const handlePress = () => {
    try {
      if (onPress) {
        onPress();
      }
    } catch (error) {
      console.error('Error handling task card press:', error);
    }
  };

  const handleComplete = () => {
    try {
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error handling task completion:', error);
    }
  };

  // Validate required props
  if (!task || !task.id) {
    console.error('TaskCard: Invalid task prop provided');
    return (
      <View style={commonStyles.card}>
        <Text style={commonStyles.textSecondary}>Invalid task data</Text>
      </View>
    );
  }

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
      onPress={handlePress}
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
              {task.title || 'Untitled Task'}
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
                  {user.name || 'Unknown User'}
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
                {task.priority || 'medium'}
              </Text>
            </View>

            {task.points && typeof task.points === 'number' && task.points > 0 && (
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
            onPress={handleComplete}
          >
            <Icon name="checkmark" size={16} color={colors.backgroundAlt} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
