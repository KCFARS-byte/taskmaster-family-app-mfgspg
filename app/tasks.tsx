
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { taskStore } from '../data/store';
import { Task } from '../types';
import Icon from '../components/Icon';
import TaskCard from '../components/TaskCard';

type FilterType = 'all' | 'pending' | 'completed' | 'overdue';

export default function TasksScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const allTasks = taskStore.getTasks();
  const users = taskStore.getUsers();

  const getFilteredTasks = (): Task[] => {
    const now = new Date();
    switch (filter) {
      case 'pending':
        return allTasks.filter(task => !task.isCompleted);
      case 'completed':
        return allTasks.filter(task => task.isCompleted);
      case 'overdue':
        return allTasks.filter(task => !task.isCompleted && task.dueDate < now);
      default:
        return allTasks;
    }
  };

  const filteredTasks = getFilteredTasks().sort((a, b) => {
    // Sort by due date, with overdue tasks first
    if (!a.isCompleted && !b.isCompleted) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return b.dueDate.getTime() - a.dueDate.getTime();
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleTaskComplete = (taskId: string) => {
    const firstParent = taskStore.getParents()[0];
    if (firstParent) {
      taskStore.completeTask(taskId, firstParent.id);
      console.log('Task marked as complete');
    }
  };

  const filterOptions: { value: FilterType; label: string; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }[] = [
    { value: 'all', label: 'All', icon: 'list-outline' },
    { value: 'pending', label: 'Pending', icon: 'time-outline' },
    { value: 'completed', label: 'Completed', icon: 'checkmark-circle-outline' },
    { value: 'overdue', label: 'Overdue', icon: 'alert-circle-outline' },
  ];

  const getFilterCount = (filterType: FilterType): number => {
    const now = new Date();
    switch (filterType) {
      case 'pending':
        return allTasks.filter(task => !task.isCompleted).length;
      case 'completed':
        return allTasks.filter(task => task.isCompleted).length;
      case 'overdue':
        return allTasks.filter(task => !task.isCompleted && task.dueDate < now).length;
      default:
        return allTasks.length;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <View style={commonStyles.spaceBetween}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>All Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/add-task')}>
            <Icon name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 60 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
      >
        {filterOptions.map((option) => {
          const count = getFilterCount(option.value);
          const isActive = filter === option.value;
          
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 12,
                  backgroundColor: isActive ? colors.primary : colors.backgroundAlt,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setFilter(option.value)}
            >
              <Icon 
                name={option.icon} 
                size={16} 
                color={isActive ? colors.backgroundAlt : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={[
                commonStyles.textSecondary,
                { 
                  color: isActive ? colors.backgroundAlt : colors.textSecondary,
                  fontWeight: isActive ? '600' : '400',
                }
              ]}>
                {option.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length === 0 ? (
          <View style={[commonStyles.center, { marginTop: 60 }]}>
            <Icon name="list-outline" size={64} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              No tasks found
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
              {filter === 'all' 
                ? 'Create your first task to get started'
                : `No ${filter} tasks at the moment`
              }
            </Text>
          </View>
        ) : (
          <>
            <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
              Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </Text>
            
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                user={taskStore.getUserById(task.assignedTo)}
                onComplete={() => handleTaskComplete(task.id)}
                onPress={() => router.push(`/task/${task.id}`)}
              />
            ))}
          </>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
