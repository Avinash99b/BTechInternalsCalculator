import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Easing,
  ActivityIndicator,
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
  const modalScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      modalScaleAnim.setValue(0);
      setHtno('');
      setPassword('');
    }
  }, [visible]);

  const handleLogin = () => {
    if (htno.trim() && password.trim()) {
      onLogin({ htno, password:password });
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
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
            <Ionicons name="log-in" size={32} color="#FF6347" />
            <Text style={styles.modalTitle}>Vignan Login</Text>
          </View>

          <Text style={styles.modalDescription}>
            Enter your credentials to fetch internals automatically.
          </Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Hall Ticket Number"
            value={htno}
            onChangeText={setHtno}
            autoCapitalize="characters"
            autoFocus
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

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
                <Text style={styles.confirmButtonText}>Login</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  disabledButton: {
    opacity: 0.5,
  },
});
