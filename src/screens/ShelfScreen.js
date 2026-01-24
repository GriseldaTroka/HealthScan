// src/screens/ShelfScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import ProductCard from '../components/ProductCard';
import { generateRecipes } from '../services/aiService';
import { COLORS, SPACING, RADIUS, FONTS } from '../styles/theme';

const ShelfScreen = ({ navigation, route }) => {
  const { shelf, removeFromShelf, healthConditions, setGeneratedRecipes } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-generate recipes when new product is added
  useEffect(() => {
    const newProduct = route?.params?.newProduct;
    if (newProduct && shelf.length > 0) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        handleGenerateRecipes();
      }, 500);
    }
  }, [route?.params?.newProduct]);

  const handleGenerateRecipes = async () => {
    if (shelf.length === 0) {
      Alert.alert('Rafti bosh', 'Skano disa produkte para se të gjenerosh receta');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating recipes from', shelf.length, 'products...');
      const recipes = await generateRecipes(shelf, healthConditions);
      
      // Add unique IDs to recipes
      const recipesWithIds = recipes.map((recipe, index) => ({
        ...recipe,
        id: `recipe_${Date.now()}_${index}`,
      }));

      // Save to context
      setGeneratedRecipes(recipesWithIds);
      
      Alert.alert(
        'Receta të gjeneruara!',
        `U gjeneruan ${recipes.length} receta bazuar në produktet tuaja`,
        [
          {
            text: 'Shiko recetat',
            onPress: () => navigation.navigate('Receta'),
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Recipe generation error:', error);
      Alert.alert('Gabim', error.message || 'Nuk u arritën të gjenerojnë receta');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderEmptyShelf = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="basket-outline" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>Rafti juaj është bosh!</Text>
      <Text style={styles.emptySubtitle}>
        Skano produkte për t'i shtuar në raft dhe për të gjeneruar receta
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Skano')}
      >
        <Ionicons name="scan" size={20} color={COLORS.white} />
        <Text style={styles.scanButtonText}>Nis Skanimin</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rafti im</Text>
          <Text style={styles.subtitle}>{shelf.length} produkte të sigurta</Text>
        </View>
        {shelf.length > 0 && (
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleGenerateRecipes}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="refresh" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {shelf.length === 0 ? (
        renderEmptyShelf()
      ) : (
        <>
          <FlatList
            data={shelf}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onRemove={() => removeFromShelf(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Generate Recipes Button */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={[styles.generateButton, isGenerating && styles.generatingButton]}
              onPress={handleGenerateRecipes}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.generateButtonText}>Duke gjeneruar receta...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color={COLORS.white} />
                  <Text style={styles.generateButtonText}>Gjenerо receta me AI</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewRecipesButton}
              onPress={() => navigation.navigate('Receta')}
            >
              <Ionicons name="restaurant" size={20} color={COLORS.primary} />
              <Text style={styles.viewRecipesText}>Shiko recetat</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 180,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xl,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xxl,
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
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generatingButton: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  viewRecipesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  viewRecipesText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});

export default ShelfScreen;