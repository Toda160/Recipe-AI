import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";
import { strings } from "../constants/strings";
import { colors } from "../constants/colors";
import { getSearchQuery, setSearchQuery } from "../store/searchQuery";
import { setSearchResults, getSearchResults } from "../store/searchResults";
import { toggleFavorite, isFavorite } from "../store/favorites";
import { setSelectedRecipe } from "../store/selectedRecipe";
import { getRecipes } from "../services/recipeService";
import { Recipe } from "../types/Recipe";

export default function SearchResultsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const queryRef = useRef<string>(query);
  const inFlightRef = useRef<string | null>(null);
  const fetchCounterRef = useRef<number>(0);

  // keep a ref of the current query so url-change listeners can read it
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const handleSearchBarChange = useCallback((t: string) => {
    setQuery(t);
    try {
      setSearchQuery(t);
    } catch {
      // ignore
    }
  }, []);

  const fetchRecipes = useCallback(async (q: string, force = false) => {
    if (!q || q.trim().length === 0) {
      setRecipes([]);
      return;
    }

    // increment counter to track this specific fetch request
    const currentFetchId = ++fetchCounterRef.current;

    // prevent duplicate concurrent fetches for the same query UNLESS force=true
    if (!force && inFlightRef.current === q) {
      return;
    }

    // clear in-flight and set to current query
    inFlightRef.current = q;
    setLoading(true);
    setError(null);

    try {
      const res = await getRecipes(q, 6, true);

      // only update state if this is still the most recent fetch
      if (currentFetchId === fetchCounterRef.current) {
        setRecipes(res);
        // only cache non-empty results
        if (res && res.length > 0) {
          try {
            setSearchResults(q, res);
          } catch {
            // ignore caching errors
          }
        }
      }
    } catch {
      // only show error if this is still the most recent fetch
      if (currentFetchId === fetchCounterRef.current) {
        setError("Failed to load recipes");
      }
    } finally {
      // only update loading state if this is still the most recent fetch
      if (currentFetchId === fetchCounterRef.current) {
        setLoading(false);
      }
      // clear in-flight marker only if it still refers to this query
      if (inFlightRef.current === q) {
        inFlightRef.current = null;
      }
    }
  }, []);

  const fetchMore = useCallback(async () => {
    const q = queryRef.current || getSearchQuery() || "";
    if (!q || q.trim().length === 0) return;

    // increment counter for this fetch
    const currentFetchId = ++fetchCounterRef.current;

    // set both global and button loading flags
    setLoading(true);
    setLoadingMore(true);

    try {
      const res = await getRecipes(q, 6, true);

      // only update if this is still the most recent fetch
      if (currentFetchId === fetchCounterRef.current) {
        setRecipes(res);
        // only cache non-empty results
        if (res && res.length > 0) {
          try {
            setSearchResults(q, res);
          } catch {
            // ignore cache errors
          }
        }
      }
    } catch {
      // only show error if this is still the most recent fetch
      if (currentFetchId === fetchCounterRef.current) {
        setError("Failed to load more recipes");
      }
    } finally {
      // only update loading states if this is still the most recent fetch
      if (currentFetchId === fetchCounterRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  // on mount: read URL query param and restore cached results or fetch
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const search = window.location.search || "";
        const usp = new URLSearchParams(search);
        const rawQ = usp.has("q") ? usp.get("q") : null;
        const q = rawQ !== null ? rawQ ?? "" : getSearchQuery() || "";
        setQuery(q);
        queryRef.current = q;

        const cached = getSearchResults();
        if (rawQ !== null) {
          if (cached && cached.query === q && Array.isArray(cached.results)) {
            setRecipes(cached.results as Recipe[]);
          } else if (q && q.length > 0) {
            fetchRecipes(q);
          }
        } else {
          if (cached && cached.query === q && Array.isArray(cached.results)) {
            setRecipes(cached.results as Recipe[]);
          } else if (q && q.length > 0) {
            fetchRecipes(q);
          }
        }
      } else {
        const q = getSearchQuery() || "";
        setQuery(q);
        queryRef.current = q;
        const cached = getSearchResults();
        if (cached && cached.query === q && Array.isArray(cached.results)) {
          setRecipes(cached.results as Recipe[]);
        } else if (q && q.length > 0) fetchRecipes(q);
      }
    } catch {
      // noop on native where window may be undefined
    }

    // also set up a listener for URL changes via pushState/replaceState
    let intervalId: any = null;
    if (typeof window !== "undefined" && window.location) {
      // poll URL to detect changes (simple but reliable) - web only
      let lastUrl = window.location.href;
      intervalId = setInterval(() => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          const search = window.location.search || "";
          const usp = new URLSearchParams(search);
          const newQ = usp.has("q") ? usp.get("q") ?? "" : "";
          if (newQ !== queryRef.current) {
            setQuery(newQ);
            queryRef.current = newQ;
            const cached = getSearchResults();
            if (
              cached &&
              cached.query === newQ &&
              Array.isArray(cached.results)
            ) {
              setRecipes(cached.results as Recipe[]);
            } else if (newQ && newQ.length > 0) {
              fetchRecipes(newQ);
            }
          }
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchRecipes]);

  // Listen for browser back/forward navigation to restore query and results
  useEffect(() => {
    const handlePopState = () => {
      try {
        if (typeof window !== "undefined") {
          const search = window.location.search || "";
          const usp = new URLSearchParams(search);
          const q = usp.has("q") ? usp.get("q") ?? "" : "";
          setQuery(q);
          queryRef.current = q;

          const cached = getSearchResults();
          if (cached && cached.query === q && Array.isArray(cached.results)) {
            setRecipes(cached.results as Recipe[]);
          } else if (q && q.length > 0) {
            fetchRecipes(q);
          }
        }
      } catch {
        // ignore
      }
    };

    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [fetchRecipes]);

  const handleSubmit = useCallback(
    (submittedText?: string) => {
      const q =
        typeof submittedText === "string" ? submittedText : queryRef.current;

      if (!q || q.trim().length === 0) return;

      // Check if we're already showing results for this exact query
      const isSameQuery = queryRef.current === q;

      // keep ref in sync immediately so URL-change listeners won't refetch
      queryRef.current = q;

      // Only update URL if it's a different query
      if (!isSameQuery) {
        (router as any).push(`/search-results?q=${encodeURIComponent(q)}`);
      }

      // keep local state in sync
      setQuery(q);
      try {
        setSearchQuery(q);
      } catch {
        // ignore
      }

      // always force fetch when user explicitly submits (even for same query)
      fetchRecipes(q, true);
    },
    [router, fetchRecipes]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    // don't clear shared store here — keep fetched recipes visible until the user searches again
    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("q");
        window.history.replaceState({}, "", url.toString());
      } else {
        (router as any).push(`/search-results`);
      }
    } catch {
      // ignore errors
    }
  }, [router]);

  // handle submit coming from SearchBar (uses latest queryRef when needed)
  const handleSearchBarSubmit = useCallback(
    (submittedText?: string) => {
      const textToUse =
        typeof submittedText === "string" ? submittedText : queryRef.current;
      try {
        setSearchQuery(textToUse);
      } catch {
        // ignore
      }
      handleSubmit(textToUse);
    },
    [handleSubmit]
  );

  // card handlers: keep stable references via useCallback and precompute per-item handlers
  const handleToggleFavorite = useCallback((r: Recipe) => {
    toggleFavorite(r);
  }, []);

  const handleCardPress = useCallback(
    (r: Recipe) => {
      try {
        setSelectedRecipe(r);
      } catch {
        // ignore
      }
      (router as any).push(
        `/recipe-details?payload=${encodeURIComponent(JSON.stringify(r))}`
      );
    },
    [router]
  );

  const recipeHandlers = useMemo(() => {
    return recipes.map((r) => ({
      onPress: () => handleCardPress(r),
      onToggleFavorite: () => handleToggleFavorite(r),
    }));
  }, [recipes, handleCardPress, handleToggleFavorite]);

  // No default mocked suggestions — do not show placeholder "mashed potatoes" on fresh start

  // decide what to render: loading, error, fetched recipes or suggestions
  let content: React.ReactNode = null;
  if (loading) {
    content = (
      <View style={{ width: "100%", alignItems: "center", padding: 24 }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  } else if (error) {
    content = (
      <Text style={{ color: "#DC2626", marginVertical: 8 }}>{error}</Text>
    );
  } else if (recipes.length > 0) {
    content = recipes.map((r, idx) => {
      const h = recipeHandlers[idx];
      return (
        <View key={r.id ?? idx} style={{ marginBottom: 12, width: "100%" }}>
          <RecipeCard
            title={r.title}
            time={r.time}
            image={r.image}
            isFavorite={isFavorite(r.id)}
            onToggleFavorite={h?.onToggleFavorite}
            onPress={h?.onPress}
          />
        </View>
      );
    });
  } else {
    // When we have no recipes, and no query, render a gentle prompt (instead of dummy suggestions)
    content = (
      <View style={{ width: "100%", alignItems: "center", padding: 24 }}>
        <Text style={{ color: colors.muted }}>
          {query && query.length > 0
            ? strings.noRecipesFound
            : strings.searchPrompt}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topContainer}>
        <View style={styles.navRow}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => (router as any).push(`/`)}
          >
            <Text style={styles.navLink}>← Favorites</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <SearchBar
            value={query}
            onChangeText={handleSearchBarChange}
            // Receive the native submitted text to avoid races between
            // onChangeText->setState and onSubmit
            onSubmit={handleSearchBarSubmit}
            onClear={handleClear}
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
              {strings.suggestedTitle}
            </Text>

            {content}
            {query && query.length > 0 && (
              <View style={{ width: "100%", marginTop: 12 }}>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={fetchMore}
                  style={styles.loadMoreButton}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loadMoreText}>
                      I don&apos;t like these
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
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
  sectionTitleLeft: {
    fontSize: 38,
    fontWeight: "700",
    marginTop: 0,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  favoritesContainer: {
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  favoritesInner: {
    width: "100%",
    maxWidth: 384,
    alignItems: "flex-start",
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
  loadMoreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 8,
    minWidth: 160,
  },
  loadMoreText: {
    color: "white",
    fontWeight: "700",
  },
});
