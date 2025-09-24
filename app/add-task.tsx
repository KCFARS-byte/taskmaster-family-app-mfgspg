
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { taskStore } from '../data/store';
import { RepeatType, TaskCategory, TaskPriority } from '../types';
import Icon from '../components/Icon';
import UserAvatar from '../components/UserAvatar';

export default function AddTask() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [category, setCategory] = useState<TaskCategory>('chores');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [points, setPoints] = useState('10');

  const children = taskStore.getChildren();
  const parents = taskStore.getParents();

  const handleSave = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('Error', 'Please enter a task title');
        return;
      }

      if (!assignedTo) {
        Alert.alert('Error', 'Please select who to assign this task to');
        return;
      }

      const firstParent = parents[0];
      if (!firstParent) {
        Alert.alert('Error', 'No parent found to create task');
        return;
      }

      // Validate points input
      const pointsValue = parseInt(points);
      if (isNaN(pointsValue) || pointsValue < 0) {
        Alert.alert('Error', 'Points must be a valid number greater than or equal to 0');
        return;
      }

      // Validate due date
      if (!dueDate || !(dueDate instanceof Date) || isNaN(dueDate.getTime())) {
        Alert.alert('Error', 'Please select a valid due date');
        return;
      }

      const newTask = taskStore.addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        assignedTo,
        createdBy: firstParent.id,
        dueDate,
        isCompleted: false,
        repeatType,
        category,
        priority,
        points: pointsValue,
      });

      console.log('Task created successfully:', newTask.title);

      Alert.alert('Success', 'Task created successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            try {
              router.back();
            } catch (error) {
              console.error('Error navigating back:', error);
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    try {
      setShowDatePicker(false);
      if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
        setDueDate(selectedDate);
      }
    } catch (error) {
      console.error('Error handling date change:', error);
    }
  };

  const handlePointsChange = (text: string) => {
    try {
      // Only allow numeric input
      const numericText = text.replace(/[^0-9]/g, '');
      setPoints(numericText);
    } catch (error) {
      console.error('Error handling points change:', error);
    }
  };

  const handleBackPress = () => {
    try {
      router.back();
    } catch (error) {
      console.error('Error navigating back:', error);
    }
  };

  const repeatOptions: { value: RepeatType; label: string }[] = [
    { value: 'none', label: 'One time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const categoryOptions: { value: TaskCategory; label: string; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }[] = [
    { value: 'chores', label: 'Chores', icon: 'home-outline' },
    { value: 'homework', label: 'Homework', icon: 'book-outline' },
    { value: 'personal', label: 'Personal', icon: 'person-outline' },
    { value: 'other', label: 'Other', icon: 'list-outline' },
  ];

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: colors.textSecondary },
    { value: 'medium', label: 'Medium', color: colors.warning },
    { value: 'high', label: 'High', color: colors.error },
  ];

  const formatDateTime = (date: Date): string => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} at ${timeStr}`;
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Invalid date';
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <View style={commonStyles.spaceBetween}>
          <TouchableOpacity onPress={handleBackPress}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Add Task</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Task Title */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Task Title *
          </Text>
          <TextInput
            style={[
              commonStyles.card,
              {
                borderWidth: 1,
                borderColor: colors.border,
                fontSize: 16,
                color: colors.text,
              }
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title..."
            placeholderTextColor={colors.textSecondary}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Description
          </Text>
          <TextInput
            style={[
              commonStyles.card,
              {
                borderWidth: 1,
                borderColor: colors.border,
                fontSize: 16,
                color: colors.text,
                minHeight: 80,
                textAlignVertical: 'top',
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
        </View>

        {/* Assign To */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Assign To *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  commonStyles.card,
                  {
                    marginRight: 12,
                    minWidth: 100,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: assignedTo === child.id ? colors.primary : colors.border,
                    backgroundColor: assignedTo === child.id ? colors.primary + '20' : colors.backgroundAlt,
                  }
                ]}
                onPress={() => setAssignedTo(child.id)}
              >
                <UserAvatar user={child} size={40} />
                <Text style={[commonStyles.textSecondary, { marginTop: 8, textAlign: 'center' }]}>
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Due Date */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Due Date
          </Text>
          <TouchableOpacity
            style={[
              commonStyles.card,
              {
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
              }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginLeft: 12 }]}>
              {formatDateTime(dueDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Repeat */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Repeat
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {repeatOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  commonStyles.card,
                  {
                    marginRight: 12,
                    paddingHorizontal: 16,
                    borderWidth: 2,
                    borderColor: repeatType === option.value ? colors.primary : colors.border,
                    backgroundColor: repeatType === option.value ? colors.primary + '20' : colors.backgroundAlt,
                  }
                ]}
                onPress={() => setRepeatType(option.value)}
              >
                <Text style={[
                  commonStyles.textSecondary,
                  { color: repeatType === option.value ? colors.primary : colors.textSecondary }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  commonStyles.card,
                  {
                    marginRight: 12,
                    alignItems: 'center',
                    minWidth: 80,
                    borderWidth: 2,
                    borderColor: category === option.value ? colors.primary : colors.border,
                    backgroundColor: category === option.value ? colors.primary + '20' : colors.backgroundAlt,
                  }
                ]}
                onPress={() => setCategory(option.value)}
              >
                <Icon 
                  name={option.icon} 
                  size={24} 
                  color={category === option.value ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  commonStyles.textSecondary,
                  { 
                    marginTop: 4,
                    fontSize: 12,
                    color: category === option.value ? colors.primary : colors.textSecondary 
                  }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Priority */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Priority
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  commonStyles.card,
                  {
                    marginRight: 12,
                    paddingHorizontal: 16,
                    borderWidth: 2,
                    borderColor: priority === option.value ? option.color : colors.border,
                    backgroundColor: priority === option.value ? option.color + '20' : colors.backgroundAlt,
                  }
                ]}
                onPress={() => setPriority(option.value)}
              >
                <Text style={[
                  commonStyles.textSecondary,
                  { color: priority === option.value ? option.color : colors.textSecondary }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Points */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Points
          </Text>
          <TextInput
            style={[
              commonStyles.card,
              {
                borderWidth: 1,
                borderColor: colors.border,
                fontSize: 16,
                color: colors.text,
              }
            ]}
            value={points}
            onChangeText={handlePointsChange}
            placeholder="10"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[buttonStyles.primary, { marginTop: 20, marginBottom: 40 }]}
          onPress={handleSave}
        >
          <Text style={[commonStyles.text, { color: colors.backgroundAlt, fontWeight: '600' }]}>
            Create Task
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}
