import React, { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome5 name="times" size={20} color={theme.colors.textDim} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    maxWidth: 500,
    padding: 20,
    justifyContent: 'flex-end', // Garante que o modal suba a partir de baixo
    flex: 1,
  },
  modalContainer: {
    backgroundColor: theme.colors.dark,
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%', // Limita a altura para não cobrir a tela toda
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: Platform.OS === 'ios' ? 20 : 0, // Espaço extra no iOS
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingBottom: 10,
  },
});
