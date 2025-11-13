import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SubjectMarks } from '../utils/vignanApiClass';

interface SubjectDetailModalProps {
  visible: boolean;
  onClose: () => void;
  subject: SubjectMarks | null;
}

const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  visible,
  onClose,
  subject,
}) => {
  if (!subject) return null;

  // Extract all dynamic columns (excluding subjectCode and subjectName)
  const details = Object.entries(subject)
    .filter(([key]) => key !== 'subjectCode' && key !== 'subjectName')
    .map(([key, value]) => {
      const val = value as string;
      const isFinalMarks = key.toLowerCase().includes('finalmarks');
      const hasFinalValue = val && val !== 'N/A' && val.trim() !== '' && val.trim() !== '&nbsp;';
      
      return {
        label: key,
        value: val,
        isFinalMarks: isFinalMarks && hasFinalValue,
      };
    });

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{subject.subjectName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={28} color="#555" />
            </TouchableOpacity>
          </View>
          <View style={styles.subjectCodeContainer}>
            <Text style={styles.subjectCodeLabel}>Subject Code:</Text>
            <Text style={styles.subjectCodeValue}>{subject.subjectCode}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.detailsContainer}>
            {details.map((item, index) => (
              <View key={index} style={[
                styles.detailRow,
                item.isFinalMarks && styles.detailRowHighlight
              ]}>
                <Text style={[
                  styles.label,
                  item.isFinalMarks && styles.labelHighlight
                ]}>{item.label}</Text>
                <Text style={[
                  styles.value,
                  item.value === 'N/A' && styles.naValue,
                  item.isFinalMarks && styles.valueHighlight
                ]}>{item.value}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  subjectCodeContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  subjectCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  subjectCodeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007BFF',
  },
  detailsContainer: {
    paddingBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailRowHighlight: {
    backgroundColor: '#fff5f5',
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  label: {
    fontSize: 15,
    color: '#555',
    flex: 1,
    marginRight: 12,
  },
  labelHighlight: {
    color: '#ff4444',
    fontWeight: '700',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  valueHighlight: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '700',
  },
  naValue: {
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SubjectDetailModal;
