// components/ui/Toast.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onHide: () => void;
  duration?: number;
}

export function Toast({ visible, message, type = 'info', onHide, duration = 3000 }: ToastProps) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  const getIconName = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'times-circle';
      case 'warning': return 'exclamation-triangle';
      default: return 'info-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return theme.colors.success + '20';
      case 'error': return theme.colors.danger + '20';
      case 'warning': return theme.colors.warning + '20';
      default: return theme.colors.info + '20';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      case 'warning': return theme.colors.warning;
      default: return theme.colors.info;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.danger;
      case 'warning': return theme.colors.warning;
      default: return theme.colors.info;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
    >
      <FontAwesome5 name={getIconName()} size={20} color={getIconColor()} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});