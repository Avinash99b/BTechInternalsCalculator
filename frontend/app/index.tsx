import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RegulationItem from "./components/RegulationItem";
import { router, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

export default function Index() {
  const navigator = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const items = [
    { name: "R23", location: "./R23Page", icon: "school" },
    { name: "R24\n(Soon)", location: undefined, icon: "hourglass" },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ff0000ff" }}
      edges={["top", "left", "right"]}
    >
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="calculator" size={48} color="#FF6347" />
          </View>
          <Text style={styles.title}>Internals Calculator</Text>
          <Text style={styles.subtitle}>Select Your Regulation</Text>
        </Animated.View>

        <Animated.View style={[styles.gridContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={items}
            numColumns={2}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              const itemAnim = new Animated.Value(0);
              Animated.timing(itemAnim, {
                toValue: 1,
                duration: 500,
                delay: 400 + index * 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.5)),
              }).start();

              return (
                <Animated.View
                  style={[
                    styles.itemWrapper,
                    {
                      opacity: itemAnim,
                      transform: [
                        {
                          scale: itemAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          }),
                        },
                        {
                          translateY: itemAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.regulationCard,
                      item.location === undefined && styles.disabledCard,
                      { transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}
                    onPress={() => {
                      if (item.location === undefined) {
                        Toast.show({
                          type: "info",
                          text1: "Coming Soon! 🚀",
                          text2: "This regulation will be available soon",
                          visibilityTime: 2000,
                        });
                        return;
                      }
                      router.push("./R23Page");
                    }}
                  >
                    <View style={styles.cardContent}>
                      <View
                        style={[
                          styles.iconContainer,
                          item.location === undefined && styles.disabledIcon,
                        ]}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={40}
                          color={
                            item.location === undefined ? "#999" : "#FF6347"
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.cardText,
                          item.location === undefined && styles.disabledText,
                        ]}
                      >
                        {item.name.split("\n")[0]}
                      </Text>
                      {item.location === undefined && (
                        <View style={styles.comingSoonBadge}>
                          <Text style={styles.comingSoonText}>Soon</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                </Animated.View>
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.footerContent}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#666"
            />
            <Text style={styles.footerText}>
              Calculate your internal marks accurately
            </Text>
          </View>
        </Animated.View>

        <Toast />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFE5E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#FF6347",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  gridContainer: {
    flex: 1,
    paddingTop: 20,
  },
  listContent: {
    padding: 16,
    alignItems: "center",
  },
  itemWrapper: {
    width: "48%",
    aspectRatio: 1,
    padding: 8,
  },
  regulationCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#FF6347",
  },
  disabledCard: {
    borderColor: "#e0e0e0",
    opacity: 0.6,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFE5E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  disabledIcon: {
    backgroundColor: "#f0f0f0",
  },
  cardText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#333",
    textAlign: "center",
  },
  disabledText: {
    color: "#999",
  },
  comingSoonBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});
