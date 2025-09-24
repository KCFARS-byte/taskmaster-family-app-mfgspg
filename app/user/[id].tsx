
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { taskStore } from '../../data/store';
import Icon from '../../components/Icon';
import TaskCard from '../../components/TaskCard';
import UserAvatar from '../../components/UserAvatar';

export default function UserProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);

  if (!id) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Text style={commonStyles.text}>User not found</Text>
      </SafeAreaView>
    );
  }

  const user = taskStore.getUserById(id);
  const userTasks = taskStore.getTasksForUser(id);
  const stats = taskStore.getCompletionStats(id);
  const totalPoints = taskStore.getTotalPoints(id);

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Text style={commonStyles.text}>User not found</Text>
      </SafeAreaView>
    );
  }

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

  const pendingTasks = userTasks.filter(task => !task.isCompleted);
  const completedTasks = userTasks.filter(task => task.isCompleted);
  const overdueTasks = userTasks.filter(task => !task.isCompleted && task.dueDate < new Date());

  const renderProgressRing = () => {
    const percentage = stats.percentage;
    const radius = 40;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={[commonStyles.center, { width: 100, height: 100 }]}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 8,
            borderColor: colors.border,
            position: 'absolute',
          }}
        />
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 8,
            borderColor: colors.success,
            position: 'absolute',
            transform: [{ rotate: '-90deg' }],
            borderTopColor: colors.success,
            borderRightColor: percentage > 25 ? colors.success : colors.border,
            borderBottomColor: percentage > 50 ? colors.success : colors.border,
            borderLeftColor: percentage > 75 ? colors.success : colors.border,
          }}
        />
        <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 18 }]}>
          {percentage}%
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <View style={commonStyles.spaceBetween}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>{user.name}&apos;s Profile</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={[commonStyles.card, { alignItems: 'center', marginBottom: 20 }]}>
          <UserAvatar user={user} size={80} />
          <Text style={[commonStyles.title, { marginTop: 16, fontSize: 24 }]}>
            {user.name}
          </Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 20 }]}>
            {user.isParent ? 'Parent' : 'Child'}
          </Text>

          <View style={[commonStyles.row, { width: '100%', justifyContent: 'space-around' }]}>
            <View style={commonStyles.center}>
              <Text style={[commonStyles.title, { fontSize: 20, color: colors.primary }]}>
                {totalPoints}
              </Text>
              <Text style={commonStyles.textSecondary}>Points</Text>
            </View>
            
            {renderProgressRing()}
            
            <View style={commonStyles.center}>
              <Text style={[commonStyles.title, { fontSize: 20, color: colors.success }]}>
                {stats.completed}
              </Text>
              <Text style={commonStyles.textSecondary}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Overview</Text>
          <View style={[commonStyles.row, { justifyContent: 'space-between' }]}>
            <View style={[commonStyles.card, { flex: 1, marginRight: 8, alignItems: 'center' }]}>
              <Text style={[commonStyles.title, { fontSize: 18, color: colors.warning }]}>
                {pendingTasks.length}
              </Text>
              <Text style={commonStyles.textSecondary}>Pending</Text>
            </View>
            
            <View style={[commonStyles.card, { flex: 1, marginLeft: 8, alignItems: 'center' }]}>
              <Text style={[commonStyles.title, { fontSize: 18, color: colors.error }]}>
                {overdueTasks.length}
              </Text>
              <Text style={commonStyles.textSecondary}>Overdue</Text>
            </View>
          </View>
        </View>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Pending Tasks</Text>
            {pendingTasks
              .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  user={user}
                  showUser={false}
                  onComplete={() => handleTaskComplete(task.id)}
                  onPress={() => router.push(`/task/${task.id}`)}
                />
              ))}
          </View>
        )}

        {/* Recent Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Recently Completed</Text>
            {completedTasks
              .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
              .slice(0, 5)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  user={user}
                  showUser={false}
                  onPress={() => router.push(`/task/${task.id}`)}
                />
              ))}
          </View>
        )}

        {userTasks.length === 0 && (
          <View style={[commonStyles.center, { marginTop: 60 }]}>
            <Icon name="list-outline" size={64} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              No tasks assigned yet
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
              Create a task to get started
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
