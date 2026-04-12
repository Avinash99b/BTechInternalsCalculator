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
  getMarksFromCache,
  saveMarksToCache,
  clearAllMarksCache,
} from "./utils/storage";
import { getMidMarks, SubjectMarks } from "./utils/vignanApiClass";
import SubjectDetailModal from "./components/SubjectDetailModal";

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
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectMarks | null>(null);
  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const creds = await getCredentials();
      if (creds) setHtno(creds.htno);
      else router.replace("/");

      const savedSemester = await getSelectedSemester() || "1";
      const savedMid = await getSelectedMid() || "1";
      setSelectedSemester(savedSemester);
      setSelectedMid(savedMid);

      // Load from cache first
      const cachedMarks = await getMarksFromCache(savedSemester, savedMid);
      if (cachedMarks) {
        setMarks(cachedMarks);
      }

      // Fetch fresh data in background
      fetchMarks(savedSemester, savedMid, true);
    };
    loadData();
  }, []);

  async function fetchMarks(semester?: string, mid?: string, isBackground = false) {
    const sem = semester ?? selectedSemester;
    const m = mid ?? selectedMid;
    const key = `${sem}-${m}`;
    
    if (lastFetchKeyRef.current === key && !isBackground) return;

    if (!isBackground) setIsLoading(true);

    try {
      const fetchedMarks = await getMidMarks(sem, m);
      setMarks(fetchedMarks);
      await saveMarksToCache(sem, m, fetchedMarks);
      lastFetchKeyRef.current = key;
      if (!isBackground) {
        Toast.show({ type: "success", text1: "Marks fetched successfully!" });
      }
    } catch (error) {
      console.error("Error fetching marks:", error);
      if (!isBackground) {
        Toast.show({
          type: "error",
          text1: "Failed to fetch marks",
          text2: "Please try again later.",
        });
      }
    } finally {
      if (!isBackground) setIsLoading(false);
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
          await clearAllMarksCache();
          Toast.show({ type: "success", text1: "Logged Out" });
          router.replace("/");
        },
      },
    ]);
  };

  const handleSelectMid = async (mid: string) => {
    setSelectedMid(mid);
    await saveSelectedMid(mid);
    const cachedMarks = await getMarksFromCache(selectedSemester, mid);
    if (cachedMarks) {
      setMarks(cachedMarks);
    } else {
      fetchMarks(selectedSemester, mid);
    }
  };

  const handleSubjectPress = (subject: SubjectMarks) => {
    setSelectedSubject(subject);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSubject(null);
  };

  // Get the final marks column name dynamically
  const getFinalMarksValue = (subject: SubjectMarks): { value: string; isFinal: boolean } => {
    
    const keys = Object.keys(subject).filter(k => k !== 'subjectCode' && k !== 'subjectName');
    
    // For Mid-II, check if FinalMarks column exists and has a valid value
    if (selectedMid === '2') {
      const finalMarksKey = keys.find(k => k.toLowerCase().includes('finalmarks'));
      if (finalMarksKey) {
        const finalValue = subject[finalMarksKey] || '';
        // If final marks exist and are not N/A or empty or just whitespace
        if (finalValue && finalValue !== 'N/A' && finalValue.trim() !== '' && finalValue.trim() !== '&nbsp;') {
          return { value: finalValue, isFinal: true };
        }
      }
    }
    
    // Look for columns containing "MID-I" or "MID-II"
    const midColumn = keys.find(k => k.includes('MID-I') || k.includes('MID-II'));
    if (midColumn) {
      return { value: subject[midColumn] || 'N/A', isFinal: false };
    }
    
    // Fallback to last column (excluding FinalMarks if it's empty)
    const lastKey = keys[keys.length - 1];
    return { value: lastKey ? subject[lastKey] : 'N/A', isFinal: false };
  };

  useEffect(() => {
    if (!htno) return;
    const loadAndFetchMarks = async () => {
      const cachedMarks = await getMarksFromCache(selectedSemester, selectedMid);
      if (cachedMarks) {
        setMarks(cachedMarks);
      }
      fetchMarks(selectedSemester, selectedMid, !cachedMarks);
    };
    loadAndFetchMarks();
  }, [selectedSemester, selectedMid]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Vignan Internals</Text>
        <Pressable onPress={handleLogout} style={styles.iconButton}>
          <Ionicons name="log-out-outline" size={24} color="#ff5555" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome, {htno}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Semester & Mid</Text>
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
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#007BFF" />
              <Text style={styles.loadingText}>Fetching marks...</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Results ({selectedMid === '1' ? 'Mid-I' : 'Mid-II'})</Text>
          {marks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No marks fetched yet.</Text>
              <Text style={styles.hintText}>Select a semester and tap "Fetch Marks"</Text>
            </View>
          ) : (
            marks.map((mark, i) => {
              const marksData = getFinalMarksValue(mark);
              return (
                <TouchableOpacity key={i} style={styles.marksItem} onPress={() => handleSubjectPress(mark)}>
                  <View style={styles.subjectContainer}>
                    <Text style={styles.subjectName}>{mark.subjectName}</Text>
                    <Text style={styles.subjectCode}>{mark.subjectCode}</Text>
                  </View>
                  <View style={styles.marksContainer}>
                    <Text style={[
                      styles.finalMarks,
                      marksData.isFinal && styles.finalMarksRed
                    ]}>
                      {marksData.value} / 30
                    </Text>
                    {marksData.isFinal && (
                      <Text style={styles.finalMarksLabel}>Final</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
      <SubjectDetailModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        subject={selectedSubject}
      />
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#007BFF',
  },
  marksItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  subjectName: { fontSize: 15.5, color: "#333", flexWrap: 'wrap', flexShrink: 1 },
  finalMarks: { fontSize: 16, fontWeight: "700", color: "#007BFF" },
  finalMarksRed: { 
    color: "#ff4444",
  },
  finalMarksLabel: {
    fontSize: 11,
    color: "#ff4444",
    fontWeight: "600",
    marginTop: 2,
  },
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
