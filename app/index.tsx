
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
    try {
      setRefreshing(true);
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    try {
      // For demo purposes, we'll complete as the first parent
      const firstParent = taskStore.getParents()[0];
      if (firstParent) {
        taskStore.completeTask(taskId, firstParent.id);
        console.log('Task marked as complete');
      } else {
        console.warn('No parent found to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getTaskStatusColor = (task: Task): string => {
    try {
      if (task.isCompleted) return colors.success;
      if (task.dueDate < new Date()) return colors.error;
      return colors.warning;
    } catch (error) {
      console.error('Error getting task status color:', error);
      return colors.textSecondary;
    }
  };

  const renderQuickStats = () => {
    try {
      return (
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
    } catch (error) {
      console.error('Error rendering quick stats:', error);
      return (
        <View style={commonStyles.section}>
          <Text style={commonStyles.textSecondary}>Error loading stats</Text>
        </View>
      );
    }
  };

  const renderChildren = () => {
    try {
      return (
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Children</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {children.map((child) => {
              try {
                const stats = taskStore.getCompletionStats(child.id);
                const points = taskStore.getTotalPoints(child.id);
                return (
                  <TouchableOpacity
                    key={child.id}
                    style={[commonStyles.card, { marginRight: 12, minWidth: 140, alignItems: 'center' }]}
                    onPress={() => {
                      try {
                        router.push(`/user/${child.id}`);
                      } catch (error) {
                        console.error('Error navigating to user profile:', error);
                      }
                    }}
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
              } catch (error) {
                console.error('Error rendering child card:', error);
                return (
                  <View key={child.id} style={[commonStyles.card, { marginRight: 12, minWidth: 140 }]}>
                    <Text style={commonStyles.textSecondary}>Error loading child</Text>
                  </View>
                );
              }
            })}
          </ScrollView>
        </View>
      );
    } catch (error) {
      console.error('Error rendering children:', error);
      return (
        <View style={commonStyles.section}>
          <Text style={commonStyles.textSecondary}>Error loading children</Text>
        </View>
      );
    }
  };

  const renderRecentTasks = () => {
    try {
      const recentTasks = tasks
        .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
        .slice(0, 5);

      return (
        <View style={commonStyles.section}>
          <View style={commonStyles.spaceBetween}>
            <Text style={commonStyles.subtitle}>Recent Tasks</Text>
            <TouchableOpacity onPress={() => {
              try {
                router.push('/tasks');
              } catch (error) {
                console.error('Error navigating to tasks:', error);
              }
            }}>
              <Text style={[commonStyles.textSecondary, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {recentTasks.map((task) => {
            try {
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  user={taskStore.getUserById(task.assignedTo)}
                  onComplete={() => handleTaskComplete(task.id)}
                  onPress={() => {
                    try {
                      router.push(`/task/${task.id}`);
                    } catch (error) {
                      console.error('Error navigating to task:', error);
                    }
                  }}
                />
              );
            } catch (error) {
              console.error('Error rendering task card:', error);
              return (
                <View key={task.id} style={commonStyles.card}>
                  <Text style={commonStyles.textSecondary}>Error loading task</Text>
                </View>
              );
            }
          })}
        </View>
      );
    } catch (error) {
      console.error('Error rendering recent tasks:', error);
      return (
        <View style={commonStyles.section}>
          <Text style={commonStyles.textSecondary}>Error loading recent tasks</Text>
        </View>
      );
    }
  };

  const handleAddTaskSheetClose = () => {
    try {
      setShowAddTaskSheet(false);
    } catch (error) {
      console.error('Error closing add task sheet:', error);
    }
  };

  const handleFabPress = () => {
    try {
      setShowAddTaskSheet(true);
    } catch (error) {
      console.error('Error opening add task sheet:', error);
    }
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
        onPress={handleFabPress}
      >
        <Icon name="add" size={24} color={colors.backgroundAlt} />
      </TouchableOpacity>

      {/* Add Task Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showAddTaskSheet}
        onClose={handleAddTaskSheetClose}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>
            Quick Actions
          </Text>
          
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 12 }]}
            onPress={() => {
              try {
                setShowAddTaskSheet(false);
                router.push('/add-task');
              } catch (error) {
                console.error('Error navigating to add task:', error);
              }
            }}
          >
            <Text style={[commonStyles.text, { color: colors.backgroundAlt, fontWeight: '600' }]}>
              Add New Task
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary, { marginBottom: 12 }]}
            onPress={() => {
              try {
                setShowAddTaskSheet(false);
                router.push('/users');
              } catch (error) {
                console.error('Error navigating to users:', error);
              }
            }}
          >
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              Manage Family Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.secondary]}
            onPress={() => {
              try {
                setShowAddTaskSheet(false);
                router.push('/stats');
              } catch (error) {
                console.error('Error navigating to stats:', error);
              }
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
