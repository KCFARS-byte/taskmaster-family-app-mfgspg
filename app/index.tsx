
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
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { taskStore } from '../data/store';
import { Task, User } from '../types';
import Icon from '../components/Icon';
import TaskCard from '../components/TaskCard';
import UserAvatar from '../components/UserAvatar';
import SimpleBottomSheet from '../components/BottomSheet';

export default function Dashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddTaskSheet, setShowAddTaskSheet] = useState(false);

  const tasks = taskStore.getTasks();
  const users = taskStore.getUsers();
  const children = taskStore.getChildren();
  const todaysTasks = taskStore.getTodaysTasks();
  const overdueTasks = taskStore.getOverdueTasks();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleTaskComplete = (taskId: string) => {
    // For demo purposes, we'll complete as the first parent
    const firstParent = taskStore.getParents()[0];
    if (firstParent) {
      taskStore.completeTask(taskId, firstParent.id);
      console.log('Task marked as complete');
    }
  };

  const getTaskStatusColor = (task: Task): string => {
    if (task.isCompleted) return colors.success;
    if (task.dueDate < new Date()) return colors.error;
    return colors.warning;
  };

  const renderQuickStats = () => (
    <View style={commonStyles.section}>
      <Text style={commonStyles.subtitle}>Quick Overview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[commonStyles.card, { marginRight: 12, minWidth: 120 }]}>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
            Today&apos;s Tasks
          </Text>
          <Text style={[commonStyles.title, { textAlign: 'center', fontSize: 24 }]}>
            {todaysTasks.length}
          </Text>
        </View>
        <View style={[commonStyles.card, { marginRight: 12, minWidth: 120 }]}>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
            Overdue
          </Text>
          <Text style={[commonStyles.title, { textAlign: 'center', fontSize: 24, color: colors.error }]}>
            {overdueTasks.length}
          </Text>
        </View>
        <View style={[commonStyles.card, { marginRight: 12, minWidth: 120 }]}>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
            Total Tasks
          </Text>
          <Text style={[commonStyles.title, { textAlign: 'center', fontSize: 24 }]}>
            {tasks.length}
          </Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderChildren = () => (
    <View style={commonStyles.section}>
      <Text style={commonStyles.subtitle}>Children</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {children.map((child) => {
          const stats = taskStore.getCompletionStats(child.id);
          const points = taskStore.getTotalPoints(child.id);
          return (
            <TouchableOpacity
              key={child.id}
              style={[commonStyles.card, { marginRight: 12, minWidth: 140, alignItems: 'center' }]}
              onPress={() => router.push(`/user/${child.id}`)}
            >
              <UserAvatar user={child} size={50} />
              <Text style={[commonStyles.text, { fontWeight: '600', marginTop: 8 }]}>
                {child.name}
              </Text>
              <Text style={commonStyles.textSecondary}>
                {stats.completed}/{stats.total} tasks
              </Text>
              <Text style={[commonStyles.textSecondary, { color: colors.accent }]}>
                {points} points
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderRecentTasks = () => {
    const recentTasks = tasks
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
      .slice(0, 5);

    return (
      <View style={commonStyles.section}>
        <View style={commonStyles.spaceBetween}>
          <Text style={commonStyles.subtitle}>Recent Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/tasks')}>
            <Text style={[commonStyles.textSecondary, { color: colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        {recentTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            user={taskStore.getUserById(task.assignedTo)}
            onComplete={() => handleTaskComplete(task.id)}
            onPress={() => router.push(`/task/${task.id}`)}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.title}>Family Tasks</Text>
        <Text style={commonStyles.textSecondary}>
          Manage household tasks and track progress
        </Text>
      </View>

      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderQuickStats()}
        {renderChildren()}
        {renderRecentTasks()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={buttonStyles.fab}
        onPress={() => setShowAddTaskSheet(true)}
      >
        <Icon name="add" size={24} color={colors.backgroundAlt} />
      </TouchableOpacity>

      {/* Add Task Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showAddTaskSheet}
        onClose={() => setShowAddTaskSheet(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>
            Quick Actions
          </Text>
          
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 12 }]}
            onPress={() => {
              setShowAddTaskSheet(false);
              router.push('/add-task');
            }}
          >
            <Text style={[commonStyles.text, { color: colors.backgroundAlt, fontWeight: '600' }]}>
              Add New Task
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 12 }]}
            onPress={() => {
              setShowAddTaskSheet(false);
              router.push('/users');
            }}
          >
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              Manage Family Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary]}
            onPress={() => {
              setShowAddTaskSheet(false);
              router.push('/stats');
            }}
          >
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              View Statistics
            </Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
