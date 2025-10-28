import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from "./components/Card";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { savePreset, getPresets, deletePreset, presetExists, Preset } from './utils/storage';

// Custom Drawer Component
function SideDrawer({ visible, onClose, onPresetSelect }: any) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const loadPresets = async () => {
    const loadedPresets = await getPresets();
    setPresets(loadedPresets);
  };

  useEffect(() => {
    loadPresets();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start();
    }
  }, [visible]);

  const handlePresetPress = (preset: Preset) => {
    onPresetSelect(preset);
    onClose();
  };

  const handleDeletePreset = async (subjectName: string) => {
    Alert.alert(
      'Delete Preset',
      `Are you sure you want to delete "${subjectName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePreset(subjectName);
            await loadPresets();
            Toast.show({
              type: 'success',
              text1: 'Preset Deleted',
              text2: `${subjectName} has been removed`,
            });
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.drawerOverlay,
          { opacity: overlayOpacity },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left']}>
          <View style={styles.drawerHeader}>
            <Ionicons name="bookmarks" size={32} color="#FF6347" />
            <Text style={styles.drawerTitle}>Saved Subjects</Text>
          </View>

        <ScrollView style={styles.drawerContent}>
          {presets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No saved presets yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Save your marks to quickly access them later
              </Text>
            </View>
          ) : (
            <View style={styles.presetList}>
              {presets.map((preset, index) => {
                const itemAnim = new Animated.Value(0);
                Animated.timing(itemAnim, {
                  toValue: 1,
                  duration: 400,
                  delay: index * 100,
                  useNativeDriver: true,
                  easing: Easing.out(Easing.back(1.2)),
                }).start();

                return (
                  <Animated.View
                    key={index}
                    style={{
                      opacity: itemAnim,
                      transform: [
                        {
                          translateX: itemAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0],
                          }),
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      style={styles.presetItem}
                      onPress={() => handlePresetPress(preset)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.presetItemLeft}>
                        <View style={styles.presetIconContainer}>
                          <Ionicons name="book" size={24} color="#FF6347" />
                        </View>
                        <View style={styles.presetTextContainer}>
                          <Text style={styles.presetItemText}>{preset.subjectName}</Text>
                          <Text style={styles.presetMarksText}>
                            {preset.finalInternals !== undefined 
                              ? `${Math.ceil(preset.finalInternals)} / 30`
                              : 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeletePreset(preset.subjectName)}
                        style={styles.deleteButton}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

// Main Calculator Component
export default function R23Page() {
  const [as1Marks, setAs1Marks] = useState<string>("");
  const [as2Marks, setAs2Marks] = useState<string>("");
  const [as3Marks, setAs3Marks] = useState<string>("");
  const [as4Marks, setAs4Marks] = useState<string>("");
  const [as5Marks, setAs5Marks] = useState<string>("");

  const [mid1Marks, setMid1Marks] = useState<string>("");
  const [mid1SQMarks, setMid1SQMarks] = useState<string>("");
  const [mid2Marks, setMid2Marks] = useState<string>("");
  const [mid2SQMarks, setMid2SQMarks] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const saveButtonPulse = useRef(new Animated.Value(1)).current;

  const handlePresetSelect = (preset: Preset) => {
    setAs1Marks(preset.as1Marks);
    setAs2Marks(preset.as2Marks);
    setAs3Marks(preset.as3Marks);
    setAs4Marks(preset.as4Marks);
    setAs5Marks(preset.as5Marks);
    setMid1Marks(preset.mid1Marks);
    setMid1SQMarks(preset.mid1SQMarks);
    setMid2Marks(preset.mid2Marks);
    setMid2SQMarks(preset.mid2SQMarks);
    Toast.show({
      type: 'success',
      text1: 'Preset Loaded',
      text2: `Loaded marks for ${preset.subjectName}`,
    });
  };

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(card1Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(card2Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(card3Anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for save button
    Animated.loop(
      Animated.sequence([
        Animated.timing(saveButtonPulse, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(saveButtonPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      modalScaleAnim.setValue(0);
    }
  }, [modalVisible]);

  const halvedAs1Marks = Math.ceil(Number(as1Marks) / 2);
  const halvedAs2Marks = Math.ceil(Number(as2Marks) / 2);
  const halvedAs3Marks = Math.ceil(Number(as3Marks) / 2);
  const halvedAs4Marks = Math.ceil(Number(as4Marks) / 2);
  const halvedAs5Marks = Math.ceil(Number(as5Marks) / 2);

  const firstMidAssignmentsAverage = (halvedAs1Marks + halvedAs2Marks) / 2;
  const secondMidAssignmentsAverage =
    (halvedAs3Marks + halvedAs4Marks + halvedAs5Marks) / 3;

  const firstInterals =
    Number(mid1SQMarks) +
    Number(firstMidAssignmentsAverage) +
    Number(mid1Marks) / 2;
  const secondInterals =
    Number(mid2SQMarks) +
    Number(secondMidAssignmentsAverage) +
    Number(mid2Marks) / 2;

  const finalInternals =
    Math.max(firstInterals, secondInterals) * 0.8 +
    Math.min(firstInterals, secondInterals) * 0.2;

  const handleSavePress = () => {
    setModalVisible(true);
  };

  const handleSavePreset = async () => {
    if (!subjectName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Subject Name Required',
        text2: 'Please enter a subject name',
      });
      return;
    }

    const exists = await presetExists(subjectName);

    if (exists) {
      Alert.alert(
        'Subject Already Exists',
        `A preset for "${subjectName}" already exists. Do you want to override it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Override',
            style: 'destructive',
            onPress: async () => {
              await savePresetData();
            },
          },
        ]
      );
    } else {
      await savePresetData();
    }
  };

  const savePresetData = async () => {
    const preset: Preset = {
      subjectName,
      as1Marks,
      as2Marks,
      as3Marks,
      as4Marks,
      as5Marks,
      mid1Marks,
      mid1SQMarks,
      mid2Marks,
      mid2SQMarks,
      finalInternals: finalInternals,
    };

    await savePreset(preset);
    setModalVisible(false);
    setSubjectName("");
    Toast.show({
      type: 'success',
      text1: 'Preset Saved',
      text2: `Marks saved for ${subjectName}`,
    });
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#ff0000ff' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onPresetSelect={handlePresetSelect}
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.header}>
          <Pressable
            onPress={() => setDrawerVisible(true)}
            style={({ pressed }) => [
              styles.menuButton,
              { opacity: pressed ? 0.6 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <Ionicons name="menu" size={28} color="#FF6347" />
          </Pressable>
          <Text style={styles.headerTitle}>R23 Calculator</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              width: '100%',
              alignItems: 'center',
              opacity: card1Anim,
              transform: [
                {
                  translateY: card1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                {
                  scale: card1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            }}
          >
            <Card elevation={10} show={true} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#FF6347" />
              <Text style={styles.cardTitle}>Mid 1</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assignment 1 Marks:</Text>
              <TextInput
                placeholder="Enter Your Assignment 1 Marks"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
                value={as1Marks}
                onChangeText={setAs1Marks}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assignment 2 Marks:</Text>
              <TextInput
                placeholder="Enter Your Assignment 2 Marks"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
                value={as2Marks}
                onChangeText={setAs2Marks}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mid 1 Short Q Marks:</Text>
              <TextInput
                placeholder="Enter Your Mid 1 Short Q Marks"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
                value={mid1SQMarks}
                onChangeText={setMid1SQMarks}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mid 1 Marks:</Text>
              <TextInput
                placeholder="Enter Your Mid 1 Marks"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
                value={mid1Marks}
                onChangeText={setMid1Marks}
                placeholderTextColor="#999"
              />
            </View>
          </Card>
          </Animated.View>

          <View style={styles.cardSpacer} />

          {/* MID 2 */}
          <Animated.View
            style={{
              width: '100%',
              alignItems: 'center',
              opacity: card2Anim,
              transform: [
                {
                  translateY: card2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                {
                  scale: card2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            }}
          >
          <Card elevation={10} show={true} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#FF6347" />
              <Text style={styles.cardTitle}>Mid 2</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assignment 3 Marks:</Text>
              <TextInput
                placeholder="Enter Your Assignment 3 Marks"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
                value={as3Marks}
                onChangeText={setAs3Marks}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assignment 4 Marks:</Text>
              <TextInput
                placeholder="Enter Your Assignment 4 Marks"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
                value={as4Marks}
                onChangeText={setAs4Marks}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assignment 5 Marks:</Text>
              <TextInput
                placeholder="Enter Your Assignment 5 Marks"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
                value={as5Marks}
                onChangeText={setAs5Marks}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mid 2 Short Q Marks:</Text>
              <TextInput
                placeholder="Enter Your Mid 2 Short Q Marks"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
                value={mid2SQMarks}
                onChangeText={setMid2SQMarks}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mid 2 Marks:</Text>
              <TextInput
                placeholder="Enter Your Mid 2 Marks"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={2}
                value={mid2Marks}
                onChangeText={setMid2Marks}
                placeholderTextColor="#999"
              />
            </View>
          </Card>
          </Animated.View>

          <View style={styles.cardSpacer} />

          {/* Final */}
          <Animated.View
            style={{
              width: '100%',
              alignItems: 'center',
              opacity: card3Anim,
              transform: [
                {
                  translateY: card3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                {
                  scale: card3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            }}
          >
          <Card elevation={10} show={true} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.cardTitle}>Final Calculation</Text>
            </View>

            <View style={styles.resultContainer}>
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Mid 1 Internals</Text>
                <Text style={styles.resultValue}>
                  {firstInterals.toFixed(2)}
                </Text>
              </View>

              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Mid 2 Internals</Text>
                <Text style={styles.resultValue}>
                  {secondInterals.toFixed(2)}
                </Text>
              </View>

              <View style={[styles.resultBox, styles.finalResultBox]}>
                <Text style={styles.finalResultLabel}>Final Internal Marks</Text>
                <Text style={styles.finalResultValue}>
                  {Math.ceil(finalInternals)}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleSavePress}
            >
              <Animated.View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  transform: [{ scale: saveButtonPulse }],
                }}
              >
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Preset</Text>
              </Animated.View>
            </Pressable>
          </Card>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Save Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  { scale: modalScaleAnim },
                  {
                    translateY: modalScaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
                opacity: modalScaleAnim,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="bookmark" size={32} color="#FF6347" />
              <Text style={styles.modalTitle}>Save Subject</Text>
            </View>

            <Text style={styles.modalDescription}>
              Enter a name for this subject to save your marks
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Subject Name (e.g., Mathematics)"
              value={subjectName}
              onChangeText={setSubjectName}
              autoFocus
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  setModalVisible(false);
                  setSubjectName("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.confirmButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handleSavePreset}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
      <Toast />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Drawer Styles
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  presetList: {
    padding: 12,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  presetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  presetTextContainer: {
    flex: 1,
  },
  presetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  presetMarksText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6347',
  },
  deleteButton: {
    padding: 8,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  menuButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFE5E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },

  // ScrollView Styles
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingTop: 20,
  },

  // Card Styles
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  cardSpacer: {
    height: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },

  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },

  // Result Styles
  resultContainer: {
    marginVertical: 10,
  },
  resultBox: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6347',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  finalResultBox: {
    backgroundColor: '#FFF5E6',
    borderLeftColor: '#FFD700',
  },
  finalResultLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '700',
    marginBottom: 6,
  },
  finalResultValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF6347',
  },

  // Save Button Styles
  saveButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#fafafa',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#FF6347',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
