import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { strings } from "../constants/strings";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  // allow the parent to receive the submitted text (from nativeEvent)
  onSubmit?: (text?: string) => void;
  onClear?: () => void;
  placeholder?: string;
  iconColor?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
} & TextInputProps;

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = strings.searchPlaceholder,
  iconColor,
  containerStyle,
  inputStyle,
  ...rest
}: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit?.(value)} // use value instead of e.nativeEvent.text
        underlineColorAndroid="transparent"
        style={[
          styles.input,
          inputStyle,
          Platform.OS === "web"
            ? { outlineWidth: 0, outlineColor: "transparent" }
            : null,
        ]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />

      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => {
          if (value && value.length > 0) {
            onChangeText("");
            onClear && onClear();
          } else {
            // pass current value when acting as search
            onSubmit && onSubmit(value);
          }
        }}
        style={styles.button}
      >
        <Ionicons
          name={value && value.length > 0 ? "close" : "search"}
          size={16}
          style={[styles.icon, iconColor ? { color: iconColor } : null]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.searchBg,
    borderWidth: 1,
    borderColor: colors.searchBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    height: 44,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === "android" ? 6 : 8,
    paddingRight: 8,
    fontSize: 16,
    color: colors.textMuted,
  },
  button: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: colors.icon,
  },
});
