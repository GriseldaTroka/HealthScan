// src/screens/RecipesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../styles/theme';

const RecipesScreen = ({ navigation, route }) => {
  const { generatedRecipes } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = generatedRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.ingredients?.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const navigateToRecipeDetail = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
      </View>
      <Text style={styles.emptyTitle}>Asnjë recetë e gjeneruar ende</Text>
      <Text style={styles.emptySubtitle}>
        Shto produkte në raft dhe AI do të gjenerojë receta automatikisht
      </Text>
      <View style={styles.emptySteps}>
        <View style={styles.emptyStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>Zgjidh sëmundjet/alergitë në Home</Text>
        </View>
        <View style={styles.emptyStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>Skano produktet me AI Scan</Text>
        </View>
        <View style={styles.emptyStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>Produktet e sigurta do ruhen në raft</Text>
        </View>
        <View style={styles.emptyStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepText}>AI gjeneron receta automatikisht</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Skano')}
      >
        <Ionicons name="scan" size={20} color={COLORS.white} />
        <Text style={styles.scanButtonText}>Skano tani</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.brandName}>Recetat e gjeneruara</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profili')}>
            <Ionicons name="person-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {generatedRecipes.length > 0 && (
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Ionicons name="sparkles" size={16} color={COLORS.white} />
              <Text style={styles.statText}>{generatedRecipes.length} receta AI</Text>
            </View>
          </View>
        )}
      </View>

      {generatedRecipes.length === 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Kërko receta..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textLight}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {/* Results Count */}
          <Text style={styles.resultsText}>
            {filteredRecipes.length} receta të gjenera
          </Text>

          {/* Recipe Cards */}
          <View style={styles.recipesGrid}>
            {filteredRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => navigateToRecipeDetail(recipe)}
              >
                {/* Recipe Image Placeholder with AI tag */}
                <View style={styles.imageContainer}>
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color={COLORS.textLight} />
                    <Text style={styles.aiTag}>
                      <Ionicons name="sparkles" size={12} /> AI Generated
                    </Text>
                  </View>
                  {recipe.imageUrl && (
                    <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
                  )}
                </View>
                
                <View style={styles.recipeContent}>
                  <Text style={styles.recipeName} numberOfLines={2}>{recipe.name}</Text>
                  
                  {recipe.description && (
                    <Text style={styles.recipeDescription} numberOfLines={2}>
                      {recipe.description}
                    </Text>
                  )}
                  
                  <View style={styles.recipeMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.metaText}>{recipe.time || '30 min'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="restaurant-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.metaText}>{recipe.servings || 4} porcion</Text>
                    </View>
                  </View>

                  {recipe.healthTags && recipe.healthTags.length > 0 && (
                    <View style={styles.healthTags}>
                      {recipe.healthTags.slice(0, 2).map((tag, index) => (
                        <View key={index} style={styles.healthTag}>
                          <Text style={styles.healthTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>{recipe.difficulty || 'Easy'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filteredRecipes.length === 0 && searchQuery && (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.noResultsText}>Nuk u gjetën receta për "{searchQuery}"</Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
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
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  brandName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  resultsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  recipesGrid: {
    gap: SPACING.md,
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  aiTag: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  recipeContent: {
    padding: SPACING.lg,
  },
  recipeName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  recipeDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  healthTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  healthTag: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  healthTagText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  difficultyText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.xxxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  emptySteps: {
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  emptyStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  noResultsText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  bottomPadding: {
    height: 100,
  },
});

export default RecipesScreen;