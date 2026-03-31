import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Credentials } from '../utils/storage';

interface LoginModalProps {
  visible: boolean;
  onLogin: (credentials: Credentials) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function LoginModal({ visible, onLogin, onCancel, loading }: LoginModalProps) {
  const [htno, setHtno] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [htnoFocused, setHtnoFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  // Native-driver animations for the sheet entry (translateY + opacity)
  const sheetTranslateY = useRef(new Animated.Value(300)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  // Non-native animation for keyboard offset (paddingBottom on root)
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

  // Sheet entry / exit animation
  useEffect(() => {
    if (visible) {
      sheetTranslateY.setValue(300);
      sheetOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      sheetTranslateY.setValue(300);
      sheetOpacity.setValue(0);
      setHtno('');
      setPassword('');
      setShowPassword(false);
      setError('');
    }
  }, [visible, sheetTranslateY, sheetOpacity]);

  // Keyboard listeners: animate the root's paddingBottom so the sheet rises above
  // the keyboard without using KeyboardAvoidingView (which causes phantom dismiss
  // taps on Android inside a Modal due to its layout-shrink behaviour).
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });
    const onHide = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      onShow?.remove();
      onHide?.remove();
    };
  }, [keyboardOffset]);

  const handleLogin = () => {
    if (!htno.trim()) {
      setError('Please enter your Hall Ticket Number.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    onLogin({ htno, password });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/*
        Root: flex column, default justifyContent ('flex-start').
        paddingBottom tracks keyboard height → sheet lifts above keyboard.
        The scrim (flex:1) fills all space above the sheet automatically.
      */}
      <Animated.View style={[styles.root, { paddingBottom: keyboardOffset }]}>

        {/* Scrim: tapping the dark area outside the sheet dismisses the modal */}
        <Pressable style={styles.scrim} onPress={onCancel} />

        {/* Entry animation wrapper (native driver: translateY + opacity) */}
        <Animated.View
          style={{
            transform: [{ translateY: sheetTranslateY }],
            opacity: sheetOpacity,
          }}
        >
          <View style={styles.sheet}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="log-in" size={28} color="#FF6347" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Vignan Login</Text>
                <Text style={styles.modalSubtitle}>Lara Portal</Text>
              </View>
            </View>

            <Text style={styles.modalDescription}>
              Enter your credentials to fetch internals automatically.
            </Text>

            {/* Hall Ticket Number */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Hall Ticket Number</Text>
              <View style={[styles.inputContainer, htnoFocused && styles.inputContainerFocused]}>
                <Ionicons
                  name="id-card-outline"
                  size={20}
                  color={htnoFocused ? '#FF6347' : '#aaa'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 22AB1A0512"
                  value={htno}
                  onChangeText={(text) => { setHtno(text); setError(''); }}
                  autoCapitalize="characters"
                  autoFocus
                  placeholderTextColor="#bbb"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => setHtnoFocused(true)}
                  onBlur={() => setHtnoFocused(false)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? '#FF6347' : '#aaa'}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordRef}
                  style={styles.textInput}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => { setPassword(text); setError(''); }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#bbb"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  style={styles.eyeButton}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#999"
                  />
                </Pressable>
              </View>
            </View>

            {/* Inline validation error */}
            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={16} color="#e53935" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Action buttons */}
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  { opacity: pressed ? 0.7 : 1 },
                  loading && styles.disabledButton,
                ]}
                onPress={onCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.confirmButton,
                  { opacity: pressed ? 0.7 : 1 },
                  loading && styles.disabledButton,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="log-in-outline"
                      size={18}
                      color="#fff"
                      style={styles.loginIcon}
                      accessible={false}
                    />
                    <Text style={styles.confirmButtonText}>Login</Text>
                  </>
                )}
              </Pressable>
            </View>

          </View>
        </Animated.View>

      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    // Default justifyContent ('flex-start'): scrim (flex:1) fills top,
    // sheet sits naturally at the bottom.
  },
  scrim: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff3f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#FF6347',
    fontWeight: '500',
    marginTop: 1,
  },
  modalDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 22,
    lineHeight: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 14,
    backgroundColor: '#fafafa',
    paddingHorizontal: 12,
  },
  inputContainerFocused: {
    borderColor: '#FF6347',
    backgroundColor: '#fff',
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
    color: '#1a1a1a',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    marginTop: -6,
  },
  errorText: {
    fontSize: 13,
    color: '#e53935',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginIcon: {
    marginRight: 6,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#FF6347',
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
