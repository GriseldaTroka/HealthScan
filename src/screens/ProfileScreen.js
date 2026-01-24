import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import HealthTag from '../components/HealthTag';

const HEALTH_CONDITIONS = [
  { id: '1', name: 'Gluten Free', icon: 'leaf', color: '#6B8E6B' },
  { id: '2', name: 'Low Sodium', icon: 'water', color: '#5B9BD5' },
  { id: '3', name: 'Lactose Free', icon: 'nutrition', color: '#F4A460' },
  { id: '4', name: 'Nut Allergy', icon: 'warning', color: '#E57373' },
  { id: '5', name: 'Diabetic', icon: 'fitness', color: '#9575CD' },
  { id: '6', name: 'Vegan', icon: 'leaf', color: '#81C784' },
];

const ProfileScreen = () => {
  const {
    user,
    healthConditions,
    addHealthCondition,
    removeHealthCondition,
    logout,
  } = useUser();

  const toggleCondition = (condition) => {
    const exists = healthConditions.find((c) => c.id === condition.id);
    if (exists) {
      removeHealthCondition(condition.id);
    } else {
      addHealthCondition(condition);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="#6B8E6B" />
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Conditions</Text>
          <Text style={styles.sectionSubtitle}>
            Select your dietary restrictions and allergies
          </Text>
          <View style={styles.conditionsGrid}>
            {HEALTH_CONDITIONS.map((condition) => (
              <HealthTag
                key={condition.id}
                condition={condition}
                isSelected={healthConditions.some((c) => c.id === condition.id)}
                onPress={() => toggleCondition(condition)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={22} color="#2D3D2D" />
            <Text style={styles.menuItemText}>Settings</Text>
            <Ionicons name="chevron-forward" size={22} color="#C0C0C0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={22} color="#2D3D2D" />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={22} color="#C0C0C0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={22} color="#2D3D2D" />
            <Text style={styles.menuItemText}>About</Text>
            <Ionicons name="chevron-forward" size={22} color="#C0C0C0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#E57373" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EDE8',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D4DDD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3D2D',
  },
  email: {
    fontSize: 14,
    color: '#6B8E6B',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3D2D',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#808080',
    marginBottom: 15,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#2D3D2D',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 16,
    color: '#E57373',
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ProfileScreen;