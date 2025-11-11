import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

import {
  getCredentials,
  clearCredentials,
  clearSessionCookie,
  getSelectedSemester,
  saveSelectedSemester,
  getSelectedMid,
  saveSelectedMid,
} from "./utils/storage";
import { getMidMarks, SubjectMarks } from "./utils/vignanApiClass";


// Semester Selector Component
function SemesterSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (value: string) => void;
}) {
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Semester</Text>
      <Pressable
        style={({ pressed }) => [
          styles.selector,
          pressed && { opacity: 0.8, backgroundColor: "#f0f0f0" },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>Semester {selected}</Text>
        <Ionicons name="chevron-down" size={20} color="#555" />
      </Pressable>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Semester</Text>
            <FlatList
              data={semesters}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.semesterItem,
                    item === selected && styles.semesterItemActive,
                  ]}
                  onPress={async () => {
                    onSelect(item);
                    try {
                      await saveSelectedSemester(item);
                    } catch (e) {
                      console.warn('Could not save semester', e);
                    }
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.semesterItemText,
                      item === selected && styles.semesterItemTextActive,
                    ]}
                  >
                    Semester {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function VignanPage() {
  const router = useRouter();
  const [htno, setHtno] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [selectedMid, setSelectedMid] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(false);
  const [marks, setMarks] = useState<SubjectMarks[]>([]);
  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const creds = await getCredentials();
      let savedSemester: string | null = null;
      let savedMid: string | null = null;
      try {
        savedSemester = await getSelectedSemester();
        savedMid = await getSelectedMid();
      } catch (e) {
        console.warn('Could not read saved semester', e);
      }

      if (creds) setHtno(creds.htno);
      else router.replace("/");

      if (savedSemester) setSelectedSemester(savedSemester);
      if (savedMid) setSelectedMid(savedMid);

      // Prefetch marks for the saved (or default) selection so the page shows results immediately
      const semToFetch = savedSemester ?? selectedSemester;
      const midToFetch = savedMid ?? selectedMid;
      // call fetchMarks directly (defined below) to avoid race with setState
      fetchMarks(semToFetch, midToFetch);
    };
    loadData();
  }, []);

  // Helper that actually fetches marks. Accepts optional semester/mid to avoid race with setState
  async function fetchMarks(semester?: string, mid?: string) {
    const sem = semester ?? selectedSemester;
    const m = mid ?? selectedMid;
    const key = `${sem}-${m}`;
    // avoid refetching the same selection
    if (lastFetchKeyRef.current === key) return;

    setIsLoading(true);
    try {
      const fetchedMarks = await getMidMarks(sem, m);
      setMarks(fetchedMarks);
      lastFetchKeyRef.current = key;
      Toast.show({ type: "success", text1: "Marks fetched successfully!" });
    } catch (error) {
      console.error("Error fetching marks:", error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch marks",
        text2: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearCredentials();
          await clearSessionCookie();
          Toast.show({ type: "success", text1: "Logged Out" });
          router.replace("/");
        },
      },
    ]);
  };

  const handleFetchMarks = async () => {
    // delegate to fetchMarks which handles dedup and toast
    await fetchMarks();
  };

  const handleSelectMid = async (mid: string) => {
    setSelectedMid(mid);
    try {
      await saveSelectedMid(mid);
    } catch (e) {
      console.warn('Failed to save selected mid', e);
    }
  };

  // When user changes semester or mid, automatically prefetch results (unless already fetched)
  useEffect(() => {
    // Only attempt fetch if there's a logged-in user (htno)
    if (!htno) return;
    fetchMarks();
  }, [selectedSemester, selectedMid]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Vignan Internals</Text>
        <Pressable onPress={handleLogout} style={styles.iconButton}>
          <Ionicons name="log-out-outline" size={24} color="#ff5555" />
        </Pressable>
      </View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome, {htno}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fetch Internal Marks</Text>
          <SemesterSelector
            selected={selectedSemester}
            onSelect={setSelectedSemester}
          />
          <View style={styles.midSelectorContainer}>
            <Text style={styles.label}>Select Mid</Text>
            <View style={styles.midButtonsRow}>
              <Pressable
                onPress={() => handleSelectMid('1')}
                style={({ pressed }) => [
                  styles.midButton,
                  { marginRight: 8 },
                  selectedMid === '1' && styles.midButtonActive,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.midButtonText, selectedMid === '1' && styles.midButtonTextActive]}>Mid-I</Text>
              </Pressable>
              <Pressable
                onPress={() => handleSelectMid('2')}
                style={({ pressed }) => [
                  styles.midButton,
                  selectedMid === '2' && styles.midButtonActive,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.midButtonText, selectedMid === '2' && styles.midButtonTextActive]}>Mid-II</Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.8 },
              isLoading && styles.disabledButton,
            ]}
            onPress={handleFetchMarks}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Fetch Marks</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Results ({selectedMid === '1' ? 'Mid-I' : 'Mid-II'})</Text>
          {marks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No marks fetched yet.</Text>
              <Text style={styles.hintText}>Select a semester and tap "Fetch Marks"</Text>
            </View>
          ) : (
            marks.map((mark, i) => (
              <View key={i} style={styles.marksItem}>
                <View style={styles.subjectContainer}>
                  <Text style={styles.subjectName}>{mark.subjectName}</Text>
                  <Text style={styles.subjectCode}>{mark.subjectCode}</Text>
                </View>
                <View style={styles.marksContainer}>
                  <Text style={styles.finalMarks}>{mark.finalMarks} / 30</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f6f8fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 3,
  },
  iconButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#222" },
  scrollContainer: { padding: 16, paddingBottom: 60 },
  welcomeCard: {
    backgroundColor: "#eef3ff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  welcomeText: { fontSize: 16, fontWeight: "600", color: "#333" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 14 },
  selectorContainer: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", color: "#555", marginBottom: 6 },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fafafa",
  },
  selectorText: { fontSize: 16, color: "#333" },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  disabledButton: { opacity: 0.6 },
  marksItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  subjectName: { fontSize: 15.5, color: "#333", flexWrap: 'wrap', flexShrink: 1 },
  finalMarks: { fontSize: 16, fontWeight: "700", color: "#007BFF" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 14,
    width: "85%",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  semesterItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  semesterItemActive: {
    backgroundColor: "#eef5ff",
  },
  semesterItemText: { fontSize: 16, color: "#333", textAlign: "center" },
  semesterItemTextActive: { color: "#007BFF", fontWeight: "700" },
  emptyState: { paddingVertical: 18, alignItems: 'center' },
  emptyStateText: { fontSize: 15, color: '#666', marginBottom: 6 },
  hintText: { fontSize: 13, color: '#999' },
  subjectCode: { fontSize: 13, color: '#777', marginTop: 2 },
  midSelectorContainer: { marginBottom: 12 },
  midButtonsRow: { flexDirection: 'row' },
  midButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f2f4f7',
    alignItems: 'center',
  },
  midButtonActive: { backgroundColor: '#007BFF' },
  midButtonText: { fontSize: 14, color: '#333', fontWeight: '600' },
  midButtonTextActive: { color: '#fff' },
  subjectContainer: { flex: 1, paddingRight: 12 },
  marksContainer: { width: '30%', alignItems: 'flex-end' },
});
