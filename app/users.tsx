
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { taskStore } from '../data/store';
import Icon from '../components/Icon';
import UserAvatar from '../components/UserAvatar';
import SimpleBottomSheet from '../components/BottomSheet';

export default function UsersScreen() {
  const router = useRouter();
  const [showAddUserSheet, setShowAddUserSheet] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserIsParent, setNewUserIsParent] = useState(false);

  const users = taskStore.getUsers();
  const parents = taskStore.getParents();
  const children = taskStore.getChildren();

  const userColors = [
    '#E74C3C', '#3498DB', '#9B59B6', '#F39C12', 
    '#27AE60', '#E67E22', '#2ECC71', '#8E44AD'
  ];

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const existingUser = users.find(u => u.name.toLowerCase() === newUserName.trim().toLowerCase());
    if (existingUser) {
      Alert.alert('Error', 'A user with this name already exists');
      return;
    }

    const usedColors = users.map(u => u.color);
    const availableColors = userColors.filter(color => !usedColors.includes(color));
    const selectedColor = availableColors.length > 0 ? availableColors[0] : userColors[0];

    taskStore.addUser({
      name: newUserName.trim(),
      isParent: newUserIsParent,
      color: selectedColor,
    });

    setNewUserName('');
    setNewUserIsParent(false);
    setShowAddUserSheet(false);
    
    Alert.alert('Success', 'User added successfully!');
  };

  const renderUserCard = (user: typeof users[0]) => {
    const userTasks = taskStore.getTasksForUser(user.id);
    const stats = taskStore.getCompletionStats(user.id);
    const points = taskStore.getTotalPoints(user.id);

    return (
      <TouchableOpacity
        key={user.id}
        style={commonStyles.card}
        onPress={() => router.push(`/user/${user.id}`)}
      >
        <View style={commonStyles.spaceBetween}>
          <View style={commonStyles.row}>
            <UserAvatar user={user} size={50} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                {user.name}
              </Text>
              <Text style={commonStyles.textSecondary}>
                {user.isParent ? 'Parent' : 'Child'}
              </Text>
              {!user.isParent && (
                <Text style={[commonStyles.textSecondary, { color: colors.accent }]}>
                  {points} points earned
                </Text>
              )}
            </View>
          </View>
          
          {!user.isParent && (
            <View style={commonStyles.center}>
              <Text style={[commonStyles.text, { fontWeight: '600', fontSize: 18 }]}>
                {stats.percentage}%
              </Text>
              <Text style={commonStyles.textSecondary}>
                {stats.completed}/{stats.total}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <View style={commonStyles.spaceBetween}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Family Members</Text>
          <TouchableOpacity onPress={() => setShowAddUserSheet(true)}>
            <Icon name="person-add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Parents Section */}
        {parents.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Parents</Text>
            {parents.map(renderUserCard)}
          </View>
        )}

        {/* Children Section */}
        {children.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Children</Text>
            {children.map(renderUserCard)}
          </View>
        )}

        {users.length === 0 && (
          <View style={[commonStyles.center, { marginTop: 60 }]}>
            <Icon name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              No family members added yet
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
              Add parents and children to get started
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add User Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showAddUserSheet}
        onClose={() => {
          setShowAddUserSheet(false);
          setNewUserName('');
          setNewUserIsParent(false);
        }}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>
            Add Family Member
          </Text>
          
          {/* Name Input */}
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Name
          </Text>
          <TextInput
            style={[
              commonStyles.card,
              {
                borderWidth: 1,
                borderColor: colors.border,
                fontSize: 16,
                color: colors.text,
                marginBottom: 20,
              }
            ]}
            value={newUserName}
            onChangeText={setNewUserName}
            placeholder="Enter name..."
            placeholderTextColor={colors.textSecondary}
          />

          {/* Role Selection */}
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
            Role
          </Text>
          <View style={[commonStyles.row, { marginBottom: 30 }]}>
            <TouchableOpacity
              style={[
                commonStyles.card,
                {
                  flex: 1,
                  marginRight: 8,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: !newUserIsParent ? colors.primary : colors.border,
                  backgroundColor: !newUserIsParent ? colors.primary + '20' : colors.backgroundAlt,
                }
              ]}
              onPress={() => setNewUserIsParent(false)}
            >
              <Icon 
                name="person-outline" 
                size={24} 
                color={!newUserIsParent ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                commonStyles.textSecondary,
                { 
                  marginTop: 8,
                  color: !newUserIsParent ? colors.primary : colors.textSecondary 
                }
              ]}>
                Child
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                commonStyles.card,
                {
                  flex: 1,
                  marginLeft: 8,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: newUserIsParent ? colors.primary : colors.border,
                  backgroundColor: newUserIsParent ? colors.primary + '20' : colors.backgroundAlt,
                }
              ]}
              onPress={() => setNewUserIsParent(true)}
            >
              <Icon 
                name="people-outline" 
                size={24} 
                color={newUserIsParent ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                commonStyles.textSecondary,
                { 
                  marginTop: 8,
                  color: newUserIsParent ? colors.primary : colors.textSecondary 
                }
              ]}>
                Parent
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 12 }]}
            onPress={handleAddUser}
          >
            <Text style={[commonStyles.text, { color: colors.backgroundAlt, fontWeight: '600' }]}>
              Add Family Member
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={buttonStyles.secondary}
            onPress={() => {
              setShowAddUserSheet(false);
              setNewUserName('');
              setNewUserIsParent(false);
            }}
          >
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
