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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const { colors, isDark } = useTheme();
  
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[
                styles.modalContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: isDark ? '#000' : '#888',
                  shadowOpacity: isDark ? 0.5 : 0.15,
                }
              ]}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                  >
                    <FontAwesome5 name="times" size={18} color={colors.textDim} />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.content}
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="none"
                >
                  {children}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.semibold,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingBottom: 10,
  },
});
