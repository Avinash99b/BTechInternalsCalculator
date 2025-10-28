import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Preset {
  subjectName: string;
  as1Marks: string;
  as2Marks: string;
  as3Marks: string;
  as4Marks: string;
  as5Marks: string;
  mid1Marks: string;
  mid1SQMarks: string;
  mid2Marks: string;
  mid2SQMarks: string;
  finalInternals?: number; // Optional for backward compatibility
}

const PRESETS_KEY = '@internals_presets';

export const savePreset = async (preset: Preset): Promise<void> => {
  try {
    const existingPresets = await getPresets();
    const updatedPresets = existingPresets.filter(
      (p) => p.subjectName !== preset.subjectName
    );
    updatedPresets.push(preset);
    await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
  } catch (error) {
    console.error('Error saving preset:', error);
    throw error;
  }
};

export const getPresets = async (): Promise<Preset[]> => {
  try {
    const presets = await AsyncStorage.getItem(PRESETS_KEY);
    return presets ? JSON.parse(presets) : [];
  } catch (error) {
    console.error('Error getting presets:', error);
    return [];
  }
};

export const deletePreset = async (subjectName: string): Promise<void> => {
  try {
    const existingPresets = await getPresets();
    const updatedPresets = existingPresets.filter(
      (p) => p.subjectName !== subjectName
    );
    await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
  } catch (error) {
    console.error('Error deleting preset:', error);
    throw error;
  }
};

export const presetExists = async (subjectName: string): Promise<boolean> => {
  try {
    const presets = await getPresets();
    return presets.some((p) => p.subjectName === subjectName);
  } catch (error) {
    console.error('Error checking preset existence:', error);
    return false;
  }
};
