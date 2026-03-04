import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";
import { useRouter } from "expo-router";
import { strings } from "../constants/strings";
import { setSearchQuery } from "../store/searchQuery";
import {
  getFavorites,
  subscribe as subscribeFavorites,
  toggleFavorite,
} from "../store/favorites";
import { setSelectedRecipe } from "../store/selectedRecipe";
import { colors } from "../constants/colors";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(() => getFavorites());
  const router = useRouter();

  const handleSubmit = useCallback(() => {
    // save query to temporary store and navigate
    setSearchQuery(query);
    (router as any).push(`/search-results?q=${encodeURIComponent(query)}`);
  }, [query, router]);

  const handleNavigateToSuggested = useCallback(() => {
    (router as any).push(`/search-results`);
  }, [router]);

  const handleToggleFavorite = useCallback((recipe: any) => {
    toggleFavorite(recipe);
  }, []);

  const handleRecipePress = useCallback(
    (recipe: any) => {
      // store selection for in-memory navigation and navigate with payload
      try {
        setSelectedRecipe(recipe);
      } catch {
        // ignore
      }
      (router as any).push(
        `/recipe-details?payload=${encodeURIComponent(JSON.stringify(recipe))}`
      );
    },
    [router]
  );

  // precompute handlers for each favorite recipe
  const favoriteHandlers = useMemo(() => {
    return favorites.map((f) => ({
      onToggleFavorite: () => handleToggleFavorite(f),
      onPress: () => handleRecipePress(f),
    }));
  }, [favorites, handleToggleFavorite, handleRecipePress]);

  useEffect(() => {
    const unsub = subscribeFavorites(() => {
      setFavorites(getFavorites());
    });
    return unsub;
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topContainer}>
        <View style={styles.navRow}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleNavigateToSuggested}
          >
            <Text style={styles.navLink}>Suggested recipes →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={handleSubmit}
            placeholder={strings.searchPlaceholder}
          />
        </View>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.favoritesContainer}>
          <View style={styles.favoritesInner}>
            <Text style={styles.sectionTitleLeft}>
              {strings.favoritesTitle}
            </Text>
            {favorites.length === 0 ? (
              <View style={styles.favoritesPlaceholder}>
                <Text style={styles.placeholderText}>
                  {strings.noFavorites}
                </Text>
              </View>
            ) : (
              favorites.map((f, idx) => {
                const handlers = favoriteHandlers[idx];
                return (
                  <View key={f.id} style={{ marginBottom: 12, width: "100%" }}>
                    <RecipeCard
                      title={f.title}
                      time={f.time}
                      image={f.image}
                      isFavorite={true}
                      onToggleFavorite={handlers?.onToggleFavorite}
                      onPress={handlers?.onPress}
                    />
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.pageBg,
  },
  searchContainer: {
    marginTop: 24,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  topContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 8,
    backgroundColor: "transparent",
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 0,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 38,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
    alignSelf: "center",
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 0,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  heart: {
    color: "#6D28D9",
    fontSize: 18,
  },
  favoritesPlaceholder: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  favoritesContainer: {
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  favoritesInner: {
    width: "100%",
    maxWidth: 384,
    // keep the inner column left-aligned so multiple favorites stack from the left
    alignItems: "flex-start",
  },
  sectionTitleLeft: {
    fontSize: 38,
    fontWeight: "700",
    marginTop: 0,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  navRow: {
    width: "100%",
    maxWidth: 384,
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 4,
  },
  navLink: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
});
