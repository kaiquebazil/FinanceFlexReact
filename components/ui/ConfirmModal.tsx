// components/ui/ConfirmModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
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
}: ConfirmModalProps) {
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
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.danger;
      default: return theme.colors.info;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel} // Mantém o fechamento pelo botão "voltar" do Android
    >
      {/* Removeu o TouchableWithoutFeedback */}
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* A overlay agora é apenas uma View. O toque nela não faz nada. */}
        <View style={styles.overlay} />
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <FontAwesome5
              name={getIconName()}
              size={50}
              color={getIconColor()}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonsContainer}>
            <Button
              title={cancelText}
              onPress={onCancel}
              variant="outline"
              style={styles.button}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              variant={type === 'danger' ? 'danger' : 'primary'}
              style={styles.button}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // Faz a view ocupar toda a tela
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: theme.colors.darkLight,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    // Adiciona uma sombra para dar profundidade
    ...theme.shadows.medium,
  },
  // ... resto dos estilos (iconContainer, title, message, buttonsContainer, button) permanecem iguais
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textDim,
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
});