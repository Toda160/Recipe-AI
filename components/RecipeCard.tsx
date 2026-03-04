import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

type RecipeCardProps = {
  title: string;
  time: string;
  image?: string;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (newValue: boolean) => void;
};

export default function RecipeCard({
  title,
  time,
  image,
  isFavorite = false,
  onToggleFavorite,
  onPress,
}: RecipeCardProps) {
  const [fav, setFav] = useState<boolean>(isFavorite);

  useEffect(() => {
    // keep local state in sync if parent provides controlled isFavorite
    setFav(isFavorite);
  }, [isFavorite]);

  function toggleFav(e?: GestureResponderEvent) {
    const next = !fav;
    setFav(next);
    onToggleFavorite && onToggleFavorite(next);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.left}>
        <Image
          source={require("../assets/images/image.png")}
          style={styles.imagePlaceholder}
          resizeMode="cover"
        />
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={toggleFav}
        style={styles.heartButton}
      >
        <Ionicons
          name={fav ? "heart" : "heart-outline"}
          size={22}
          color={fav ? colors.heart : colors.icon}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 384,
    height: 88,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    paddingHorizontal: 0,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  imagePlaceholder: {
    width: 88,
    height: 88,
    paddingHorizontal: 0,
    overflow: "hidden",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: colors.imageBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  time: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
  },
  heartButton: {
    padding: 8,
    marginLeft: 12,
    marginRight: 10,
  },
});
