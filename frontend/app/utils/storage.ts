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
  mid2SQMarks:string;
  finalInternals?: number; // Optional for backward compatibility
}

export interface Credentials {
  htno: string;
  password?: string;
}

const PRESETS_KEY = '@internals_presets';
const CREDENTIALS_KEY = '@vignan_credentials';
const COOKIE_KEY = '@vignan_cookie';
const SELECTED_SEM_KEY = '@vignan_selected_semester';
const SELECTED_MID_KEY = '@vignan_selected_mid';

// Preset Management
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

// Credential Management
export const saveCredentials = async (credentials: Credentials): Promise<void> => {
  try {
    await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('Error saving credentials:', error);
    throw error;
  }
};

export const getCredentials = async (): Promise<Credentials | null> => {
  try {
    const creds = await AsyncStorage.getItem(CREDENTIALS_KEY);
    return creds ? JSON.parse(creds) : null;
  } catch (error) {
    console.error('Error getting credentials:', error);
    return null;
  }
};

export const clearCredentials = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CREDENTIALS_KEY);
  } catch (error) {
    console.error('Error clearing credentials:', error);
    throw error;
  }
};

// Session Management
export const saveSessionCookie = async (cookie: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(COOKIE_KEY, cookie);
  } catch (error) {
    console.error('Error saving session cookie:', error);
    throw error;
  }
};

export const getSessionCookie = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(COOKIE_KEY);
  } catch (error) {
    console.error('Error getting session cookie:', error);
    return null;
  }
};

export const clearSessionCookie = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(COOKIE_KEY);
  } catch (error) {
    console.error('Error clearing session cookie:', error);
    throw error;
  }
};

// Selected semester persistence
export const saveSelectedSemester = async (semester: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(SELECTED_SEM_KEY, semester);
  } catch (error) {
    console.error('Error saving selected semester:', error);
    throw error;
  }
};

export const getSelectedSemester = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SELECTED_SEM_KEY);
  } catch (error) {
    console.error('Error getting selected semester:', error);
    return null;
  }
};

// Selected mid persistence (e.g., '1' for Mid-I, '2' for Mid-II)
export const saveSelectedMid = async (mid: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(SELECTED_MID_KEY, mid);
  } catch (error) {
    console.error('Error saving selected mid:', error);
    throw error;
  }
};

export const getSelectedMid = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SELECTED_MID_KEY);
  } catch (error) {
    console.error('Error getting selected mid:', error);
    return null;
  }
};

export default function(){}