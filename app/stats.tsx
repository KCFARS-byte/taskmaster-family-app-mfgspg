
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
import Icon from '../components/Icon';
import UserAvatar from '../components/UserAvatar';

export default function StatsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const allTasks = taskStore.getTasks();
  const children = taskStore.getChildren();
  const completedTasks = allTasks.filter(task => task.isCompleted);
  const pendingTasks = allTasks.filter(task => !task.isCompleted);
  const overdueTasks = allTasks.filter(task => !task.isCompleted && task.dueDate < new Date());

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getCompletionRate = (): number => {
    if (allTasks.length === 0) return 0;
    return Math.round((completedTasks.length / allTasks.length) * 100);
  };

  const getTopPerformer = () => {
    if (children.length === 0) return null;
    
    return children.reduce((top, child) => {
      const childStats = taskStore.getCompletionStats(child.id);
      const topStats = taskStore.getCompletionStats(top.id);
      
      if (childStats.percentage > topStats.percentage) {
        return child;
      }
      if (childStats.percentage === topStats.percentage && childStats.completed > topStats.completed) {
        return child;
      }
      return top;
    });
  };

  const getCategoryStats = () => {
    const categories = ['chores', 'homework', 'personal', 'other'] as const;
    return categories.map(category => {
      const categoryTasks = allTasks.filter(task => task.category === category);
      const completed = categoryTasks.filter(task => task.isCompleted).length;
      const total = categoryTasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        category,
        completed,
        total,
        percentage,
      };
    });
  };

  const topPerformer = getTopPerformer();
  const categoryStats = getCategoryStats();
  const completionRate = getCompletionRate();

  const renderProgressBar = (percentage: number, color: string = colors.primary) => (
    <View style={{
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: 8,
    }}>
      <View
        style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <View style={commonStyles.spaceBetween}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Statistics</Text>
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
        {/* Overall Stats */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Overall Progress</Text>
          <View style={commonStyles.card}>
            <View style={[commonStyles.spaceBetween, { marginBottom: 16 }]}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Completion Rate
              </Text>
              <Text style={[commonStyles.title, { fontSize: 24, color: colors.success }]}>
                {completionRate}%
              </Text>
            </View>
            {renderProgressBar(completionRate, colors.success)}
            
            <View style={[commonStyles.row, { marginTop: 16, justifyContent: 'space-around' }]}>
              <View style={commonStyles.center}>
                <Text style={[commonStyles.title, { fontSize: 20, color: colors.success }]}>
                  {completedTasks.length}
                </Text>
                <Text style={commonStyles.textSecondary}>Completed</Text>
              </View>
              
              <View style={commonStyles.center}>
                <Text style={[commonStyles.title, { fontSize: 20, color: colors.warning }]}>
                  {pendingTasks.length}
                </Text>
                <Text style={commonStyles.textSecondary}>Pending</Text>
              </View>
              
              <View style={commonStyles.center}>
                <Text style={[commonStyles.title, { fontSize: 20, color: colors.error }]}>
                  {overdueTasks.length}
                </Text>
                <Text style={commonStyles.textSecondary}>Overdue</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Performer */}
        {topPerformer && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Top Performer</Text>
            <TouchableOpacity
              style={[commonStyles.card, { alignItems: 'center' }]}
              onPress={() => router.push(`/user/${topPerformer.id}`)}
            >
              <UserAvatar user={topPerformer} size={60} />
              <Text style={[commonStyles.text, { fontWeight: '600', marginTop: 12 }]}>
                {topPerformer.name}
              </Text>
              <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
                {taskStore.getCompletionStats(topPerformer.id).percentage}% completion rate
              </Text>
              <Text style={[commonStyles.text, { color: colors.accent, fontWeight: '600' }]}>
                {taskStore.getTotalPoints(topPerformer.id)} points earned
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Children Performance */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Children Performance</Text>
          {children.map((child) => {
            const stats = taskStore.getCompletionStats(child.id);
            const points = taskStore.getTotalPoints(child.id);
            
            return (
              <TouchableOpacity
                key={child.id}
                style={commonStyles.card}
                onPress={() => router.push(`/user/${child.id}`)}
              >
                <View style={[commonStyles.spaceBetween, { marginBottom: 8 }]}>
                  <View style={commonStyles.row}>
                    <UserAvatar user={child} size={40} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                        {child.name}
                      </Text>
                      <Text style={commonStyles.textSecondary}>
                        {stats.completed}/{stats.total} tasks • {points} points
                      </Text>
                    </View>
                  </View>
                  <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                    {stats.percentage}%
                  </Text>
                </View>
                {renderProgressBar(stats.percentage)}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Breakdown */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Category Breakdown</Text>
          {categoryStats.map((stat) => {
            const getCategoryIcon = () => {
              switch (stat.category) {
                case 'chores': return 'home-outline';
                case 'homework': return 'book-outline';
                case 'personal': return 'person-outline';
                default: return 'list-outline';
              }
            };

            const getCategoryColor = () => {
              switch (stat.category) {
                case 'chores': return colors.primary;
                case 'homework': return colors.warning;
                case 'personal': return colors.accent;
                default: return colors.textSecondary;
              }
            };

            return (
              <View key={stat.category} style={commonStyles.card}>
                <View style={[commonStyles.spaceBetween, { marginBottom: 8 }]}>
                  <View style={commonStyles.row}>
                    <Icon 
                      name={getCategoryIcon() as keyof typeof import('@expo/vector-icons').Ionicons.glyphMap} 
                      size={20} 
                      color={getCategoryColor()} 
                    />
                    <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8, textTransform: 'capitalize' }]}>
                      {stat.category}
                    </Text>
                  </View>
                  <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                    {stat.completed}/{stat.total}
                  </Text>
                </View>
                {renderProgressBar(stat.percentage, getCategoryColor())}
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
