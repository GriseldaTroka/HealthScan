// src/screens/HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import HealthTag from '../components/HealthTag';
import { COLORS, SPACING, RADIUS, FONTS } from '../styles/theme';

const HEALTH_CONDITIONS = [
  { id: '1', name: 'Gluten Free', icon: 'leaf', color: '#6B8E6B' },
  { id: '2', name: 'Low Sodium', icon: 'water', color: '#5B9BD5' },
  { id: '3', name: 'Lactose Free', icon: 'nutrition', color: '#F4A460' },
  { id: '4', name: 'Nut Allergy', icon: 'warning', color: '#E57373' },
  { id: '5', name: 'Diabetic', icon: 'fitness', color: '#9575CD' },
  { id: '6', name: 'Vegan', icon: 'leaf', color: '#81C784' },
];

const CATEGORIES = [
  { name: 'Salads', icon: 'nutrition' },
  { name: 'Pasta', icon: 'restaurant' },
  { name: 'Seafood', icon: 'fish' },
  { name: 'Desserts', icon: 'ice-cream' },
  { name: 'Soups', icon: 'cafe' },
];

const HomeScreen = ({ navigation }) => {
  const { healthConditions, addHealthCondition, removeHealthCondition, shelf } = useUser();
  const [searchQuery, setSearchQuery] = React.useState('');

  const toggleCondition = (condition) => {
    const exists = healthConditions.find(c => c.id === condition.id);
    if (exists) {
      removeHealthCondition(condition.id);
    } else {
      addHealthCondition(condition);
    }
  };

  const navigateToRecipes = (category = null) => {
    navigation.navigate('Receta', { selectedCategory: category });
  };

  const navigateToShelf = () => {
    navigation.navigate('Rafti');
  };

  const navigateToScan = () => {
    navigation.navigate('Skano');
  };

  const navigateToProfile = () => {
    navigation.navigate('Profili');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Green Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Seen2Serve</Text>
          <TouchableOpacity onPress={navigateToProfile}>
            <Ionicons name="person-outline" size={29} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Category Icons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.categoryItem}
              onPress={() => navigateToRecipes(category.name)}
            >
              <View style={styles.categoryIcon}>
                <Ionicons name={category.icon} size={24} color={COLORS.white} />
              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Kërko receta, ingrediente..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={navigateToShelf}>
            <View style={styles.statIconContainer}>
              <Ionicons name="basket" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{shelf.length}</Text>
            <Text style={styles.statLabel}>Produkte në raft</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} onPress={navigateToRecipes}>
            <View style={styles.statIconContainer}>
              <Ionicons name="restaurant" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>12+</Text>
            <Text style={styles.statLabel}>Receta të disponueshme</Text>
          </TouchableOpacity>
        </View>

        {/* Smart Scan Card */}
        <TouchableOpacity
          style={styles.smartScanCard}
          onPress={navigateToScan}
        >
          <View style={styles.scanIconContainer}>
            <Ionicons name="scan" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.scanTextContainer}>
            <Text style={styles.scanTitle}>AI Scan</Text>
            <Text style={styles.scanSubtitle}>Skano produktet për të kontrolluar ingredientet</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Health Profile Section */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>Profili jote i shëndetit</Text>
          <Text style={styles.sectionSubtitle}>
            Zgjidh kushtet dhe alergitë tuaja ushqimore
          </Text>
          <View style={styles.healthGrid}>
            {HEALTH_CONDITIONS.map((condition) => (
              <HealthTag
                key={condition.id}
                condition={condition}
                isSelected={healthConditions.some(c => c.id === condition.id)}
                onPress={() => toggleCondition(condition)}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Veprime të shpejta</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToRecipes}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="book-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Shfletoni receta</Text>
              <Text style={styles.actionSubtitle}>Zbuloni recetat e reja</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToShelf}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="bookmark-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Rafti im</Text>
              <Text style={styles.actionSubtitle}>Shihni produktet tuaja të ruajtura</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          {shelf.length > 0 && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonHighlight]}
              onPress={navigateToRecipes}
            >
              <View style={[styles.actionIconContainer, styles.actionIconHighlight]}>
                <Ionicons name="bulb" size={24} color={COLORS.white} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Gjenero receta me AI</Text>
                <Text style={styles.actionSubtitle}>Bazuar në {shelf.length} produkte në raftin tuaj</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  brandName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 2,
  },
  categoriesContainer: {
    marginTop: SPACING.sm,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.xl,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: SPACING.xl,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  filterButton: {
    padding: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  smartScanCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  scanSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  healthSection: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
  quickActions: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonHighlight: {
    backgroundColor: `${COLORS.primary}10`,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionIconHighlight: {
    backgroundColor: COLORS.primary,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;