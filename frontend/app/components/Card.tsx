import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface CardProps {
  elevation?: number; // shadow intensity / elevation
  show?: boolean; // whether to render card
  style?: ViewStyle; // custom styles
  children: React.ReactNode; // any content inside the card
}

const Card: React.FC<CardProps> = ({
  elevation = 4,
  show = true,
  style,
  children,
}) => {
  if (!show) return null; // hide the card if show is false

  return (
    <View style={[styles.card, { elevation }, style]}>
      {children}
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 8,
  },
});
