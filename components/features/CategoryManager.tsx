// components/features/CategoryManager.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../hooks/useData';
import { AVAILABLE_ICONS } from '../../constants/availableIcons';

interface CategoryManagerProps {
  visible: boolean;
  onClose: () => void;
}

export function CategoryManager({ visible, onClose }: CategoryManagerProps) {
  const { colors, isDark } = useTheme();
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('tag');
  const [editingId, setEditingId] = useState<string | null>(null);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Aviso', 'Digite um nome para a categoria');
      return;
    }

    if (editingId) {
      updateCategory(editingId, {
        name: newCategoryName.trim(),
        type: selectedType,
        icon: selectedIcon
      });
      setEditingId(null);
    } else {
      addCategory({
        name: newCategoryName.trim(),
        type: selectedType,
        icon: selectedIcon
      });
    }

    setNewCategoryName('');
    setSelectedIcon('tag');
  };

  const handleEditCategory = (category: any) => {
    setEditingId(category.id);
    setNewCategoryName(category.name);
    setSelectedIcon(category.icon || 'tag');
    setSelectedType(category.type);
  };

  const currentCategories = selectedType === 'expense' ? expenseCategories : incomeCategories;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Cabeçalho */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Categorias</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Seletor de tipo */}
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: selectedType === 'income'
                      ? colors.primary
                      : (isDark ? colors.darkLight : colors.surfaceDark),
                    borderColor: selectedType === 'income' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedType('income')}
              >
                <FontAwesome5
                  name="arrow-down"
                  size={14}
                  color={selectedType === 'income' ? '#fff' : colors.success}
                />
                <Text style={[
                  styles.typeText,
                  { color: selectedType === 'income' ? '#fff' : colors.text },
                ]}>
                  Receita
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: selectedType === 'expense'
                      ? colors.primary
                      : (isDark ? colors.darkLight : colors.surfaceDark),
                    borderColor: selectedType === 'expense' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedType('expense')}
              >
                <FontAwesome5
                  name="arrow-up"
                  size={14}
                  color={selectedType === 'expense' ? '#fff' : colors.danger}
                />
                <Text style={[
                  styles.typeText,
                  { color: selectedType === 'expense' ? '#fff' : colors.text },
                ]}>
                  Despesa
                </Text>
              </TouchableOpacity>
            </View>

            {/* Seletor de ícones */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolha um ícone</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.iconSelector}
              contentContainerStyle={styles.iconSelectorContent}
            >
              {AVAILABLE_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor: selectedIcon === icon
                        ? colors.primary
                        : (isDark ? colors.darkLight : colors.surfaceDark),
                      borderColor: selectedIcon === icon ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <FontAwesome5
                    name={icon}
                    size={20}
                    color={selectedIcon === icon ? '#fff' : colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Input para nova categoria */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.darkLight : colors.surfaceDark,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Nome da categoria"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: editingId ? colors.success : colors.primary },
                ]}
                onPress={handleAddCategory}
              >
                <Text style={styles.addButtonText}>{editingId ? 'Salvar' : 'Adicionar'}</Text>
              </TouchableOpacity>
              {editingId && (
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.textDim }]}
                  onPress={() => {
                    setEditingId(null);
                    setNewCategoryName('');
                    setSelectedIcon('tag');
                  }}
                >
                  <Text style={styles.addButtonText}>X</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Lista de categorias */}
            {currentCategories.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome5 name="tag" size={32} color={colors.textDim} />
                <Text style={[styles.emptyText, { color: colors.textDim }]}>
                  Nenhuma categoria cadastrada
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {currentCategories.map((category) => (
                  <View
                    key={category.id}
                    style={[styles.categoryItem, { borderBottomColor: colors.border }]}
                  >
                    <View style={styles.categoryInfo}>
                      <View style={[
                        styles.categoryIconWrap,
                        { backgroundColor: isDark ? colors.darkLight : colors.surfaceDark },
                      ]}>
                        <FontAwesome5
                          name={category.icon || 'tag'}
                          size={16}
                          color={selectedType === 'income' ? colors.success : colors.danger}
                        />
                      </View>
                      <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                      <TouchableOpacity onPress={() => handleEditCategory(category)}>
                        <FontAwesome5 name="edit" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteCategory(category.id)}>
                        <FontAwesome5 name="trash" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Botão Fechar */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  list: {
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 10,
  },
  iconSelector: {
    maxHeight: 60,
    marginBottom: 20,
  },
  iconSelectorContent: {
    gap: 10,
    paddingRight: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
