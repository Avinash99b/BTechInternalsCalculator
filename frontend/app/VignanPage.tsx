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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { getCredentials, clearCredentials, clearSessionCookie } from './utils/storage';
import { useRouter } from "expo-router";
import { getMidMarks, SubjectMarks } from './utils/vignanApi';

// Semester Selector Component
function SemesterSelector({ selected, onSelect }: { selected: string, onSelect: (value: string) => void }) {
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Semester</Text>
      <Pressable style={styles.selector} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectorText}>Semester {selected}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </Pressable>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={semesters}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.semesterItem}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.semesterItemText}>Semester {item}</Text>
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
  const [isLoading, setIsLoading] = useState(false);
  const [marks, setMarks] = useState<SubjectMarks[]>([]);

  useEffect(() => {
    const loadCredentials = async () => {
      const creds = await getCredentials();
      if (creds) {
        setHtno(creds.htno);
      } else {
        // If no creds, something is wrong, go back to home
        router.replace('/');
      }
    };
    loadCredentials();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await clearCredentials();
            await clearSessionCookie();
            Toast.show({
              type: 'success',
              text1: 'Logged Out',
            });
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleFetchMarks = async () => {
    setIsLoading(true);
    try {
      // Assuming '1' for Mid-I and '2' for Mid-II. The user might need to specify this.
      // For now, let's fetch Mid-I marks.
      const fetchedMarks = await getMidMarks(selectedSemester, '1'); 
      setMarks(fetchedMarks);
      Toast.show({ type: 'success', text1: 'Marks fetched successfully!' });
    } catch (error) {
      console.error("Error fetching marks:", error);
      Toast.show({ type: 'error', text1: 'Failed to fetch marks', text2: 'Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Vignan Marks</Text>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
        </Pressable>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Welcome, {htno}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fetch Internals</Text>
          <SemesterSelector selected={selectedSemester} onSelect={setSelectedSemester} />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.7 : 1 },
              isLoading && styles.disabledButton
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

        {marks.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Results (Mid-I)</Text>
            {marks.map((mark, index) => (
              <View key={index} style={styles.marksItem}>
                <Text style={styles.subjectName}>{mark.subjectName} ({mark.subjectCode})</Text>
                <Text style={styles.finalMarks}>{mark.finalMarks} / 30</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  userInfo: {
    padding: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    marginBottom: 16,
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  selectorContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fafafa',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF6347',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#FF6347',
    opacity: 0.5,
  },
  marksItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subjectName: {
    fontSize: 16,
    color: '#333',
  },
  finalMarks: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6347',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    maxHeight: '50%',
  },
  semesterItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  semesterItemText: {
    fontSize: 16,
    color: '#333',
  },
});
