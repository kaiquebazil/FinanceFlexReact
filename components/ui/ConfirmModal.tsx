// components/ui/ConfirmModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './Button';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  customContent?: React.ReactNode;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  onConfirm,
  onCancel,
  customContent,
}: ConfirmModalProps) {
  const { colors, isDark } = useTheme();

  const getIconName = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'exclamation-triangle';
      case 'danger': return 'times-circle';
      default: return 'info-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'danger': return colors.danger;
      default: return colors.info;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
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
              <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}18`, borderColor: `${getIconColor()}30` }]}>
                <FontAwesome5
                  name={getIconName()}
                  size={40}
                  color={getIconColor()}
                />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.textDim }]}>{message}</Text>

              {customContent && (
                <View style={styles.customContent}>
                  {customContent}
                </View>
              )}

              <View style={styles.buttonsContainer}>
                {cancelText ? (
                  <Button
                    title={cancelText}
                    onPress={onCancel}
                    variant="outline"
                    style={styles.button}
                  />
                ) : null}
                <Button
                  title={confirmText}
                  onPress={onConfirm}
                  variant={type === 'danger' ? 'danger' : 'primary'}
                  style={styles.button}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
  },
  customContent: {
    width: '100%',
    marginBottom: 20,
  },
});
