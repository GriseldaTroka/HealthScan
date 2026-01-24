import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HealthTag = ({ condition, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: condition.color + '20' }]}>
        <Ionicons name={condition.icon} size={16} color={condition.color} />
      </View>
      <Text style={styles.text}>{condition.name}</Text>
      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: condition.color }]}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selected: {
    borderColor: '#6B8E6B',
    backgroundColor: '#F0F5F0',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    color: '#2D3D2D',
    fontWeight: '500',
  },
  checkmark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default HealthTag;