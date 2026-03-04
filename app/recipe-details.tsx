import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { toggleFavorite, isFavorite } from "../store/favorites";
import { getSelectedRecipe } from "../store/selectedRecipe";

export default function RecipeDetailsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [recipe, setRecipe] = useState<any | null>(null);
  const [fav, setFav] = useState<boolean>(false);

  useEffect(() => {
    // first try the in-memory selected recipe store (set by SearchResults on tap)
    try {
      const sel = getSelectedRecipe();
      if (sel) {
        setRecipe(sel);
        setFav(isFavorite(sel.id));
        return;
      }
    } catch {
      // ignore
    }

    // fallback: try read from URL query param `payload` (web or router-provided)
    try {
      if (typeof window !== "undefined") {
        const usp = new URLSearchParams(window.location.search);
        const payload = usp.get("payload");
        if (payload) {
          try {
            const parsed = JSON.parse(payload);
            setRecipe(parsed);
            setFav(isFavorite(parsed.id));
            return;
          } catch {
            try {
              const parsed = JSON.parse(decodeURIComponent(payload));
              setRecipe(parsed);
              setFav(isFavorite(parsed.id));
              return;
            } catch (e2) {
              console.warn("Failed to parse recipe payload", e2);
            }
          }
        }
      }

      // native fallback: try global location if available
      const search = (global as any)?.location?.search || "";
      if (search) {
        const usp = new URLSearchParams(search);
        const payload = usp.get("payload");
        if (payload) {
          try {
            const parsed = JSON.parse(payload);
            setRecipe(parsed);
            setFav(isFavorite(parsed.id));
            return;
          } catch {
            try {
              const parsed = JSON.parse(decodeURIComponent(payload));
              setRecipe(parsed);
              setFav(isFavorite(parsed.id));
              return;
            } catch (e2) {
              console.warn("Failed to parse recipe payload", e2);
            }
          }
        }
      }
    } catch (err) {
      console.warn("Failed to read recipe payload", err);
    }
  }, []);

  const handleBack = useCallback(() => {
    try {
      // on web, prefer window.history.back if there is history
      if (
        typeof window !== "undefined" &&
        window.history &&
        window.history.length > 1
      ) {
        window.history.back();
        return;
      }
    } catch {
      // ignore
    }

    try {
      // try router back (native / expo-router)
      (router as any).back();
    } catch {
      try {
        // fallback to home
        (router as any).push("/");
      } catch {
        // ignore
      }
    }
  }, [router]);

  const handleToggleFav = useCallback(() => {
    if (!recipe) return;
    toggleFavorite(recipe);
    setFav(isFavorite(recipe.id));
  }, [recipe]);

  const isWide = width >= 720;
  // compute image size: prefer 400, but scale down to available width (accounting for padding)
  const availableWidth = Math.min(width, 900) - 32; // container maxWidth and padding
  const imageSize = Math.min(400, Math.max(120, availableWidth));

  if (!recipe) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.empty}>No recipe selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.navRow}>
        <TouchableOpacity accessibilityRole="button" onPress={handleBack}>
          <Text style={styles.navLink}>← Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.container, isWide ? styles.row : styles.column]}>
          <View
            style={[styles.left, isWide ? { flex: 0.55 } : { width: "100%" }]}
          >
            <View style={[styles.imageWrap, { alignItems: "center" }]}>
              <Image
                source={require("../assets/images/image.png")}
                style={[styles.image, { width: imageSize, height: imageSize }]}
                resizeMode="cover"
              />
            </View>

            <View style={styles.metaRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{recipe.title}</Text>
                <Text style={styles.time}>{recipe.time}</Text>
              </View>

              <TouchableOpacity
                onPress={handleToggleFav}
                style={styles.heartButton}
                accessibilityRole="button"
              >
                <Ionicons
                  name={fav ? "heart" : "heart-outline"}
                  size={28}
                  color={fav ? colors.heart : colors.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[styles.right, isWide ? { flex: 0.45 } : { width: "100%" }]}
          >
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {Array.isArray(recipe.ingredients) &&
            recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ing: string, i: number) => (
                <Text key={i} style={styles.ingredient}>
                  • {ing}
                </Text>
              ))
            ) : (
              <Text style={styles.ingredient}>No ingredients provided.</Text>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              Instructions
            </Text>
            {Array.isArray(recipe.instructions) &&
            recipe.instructions.length > 0 ? (
              recipe.instructions.map((ins: string, i: number) => (
                <Text key={i} style={styles.instruction}>
                  {i + 1}. {ins}
                </Text>
              ))
            ) : (
              <Text style={styles.instruction}>No instructions provided.</Text>
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
  scroll: {
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  column: {
    flexDirection: "column",
  },
  left: {
    // left column contains image and meta
  },
  right: {
    marginTop: 12,
  },
  imageWrap: {
    backgroundColor: colors.imageBg,
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 260,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  time: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 16,
  },
  heartButton: {
    padding: 8,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 6,
  },
  instruction: {
    fontSize: 15,
    marginBottom: 8,
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    color: colors.muted,
  },
  navRow: {
    width: "100%",
    maxWidth: 900,
    paddingHorizontal: 16,
    alignItems: "flex-start",
    paddingTop: 8,
    marginBottom: 4,
  },
  navLink: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
