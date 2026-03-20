import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { AVAILABLE_ICONS } from '../../constants/availableIcons';

interface CategoryManagerProps {
  onClose: () => void;
}

export function CategoryManager({ onClose }: CategoryManagerProps) {
  const { categories, addCategory, deleteCategory } = useData();
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('tag');

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Aviso', 'Digite um nome para a categoria');
      return;
    }

    addCategory({
      name: newCategoryName.trim(),
      type: selectedType,
      icon: selectedIcon
    });

    setNewCategoryName('');
    setSelectedIcon('tag');
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}

      {/* Seletor de tipo */}
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'income' && styles.typeButtonActive
          ]}
          onPress={() => setSelectedType('income')}
        >
          <FontAwesome5 
            name="arrow-down" 
            size={14} 
            color={selectedType === 'income' ? '#fff' : theme.colors.success} 
          />
          <Text style={[
            styles.typeText,
            selectedType === 'income' && styles.typeTextActive
          ]}>
            Receita
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'expense' && styles.typeButtonActive
          ]}
          onPress={() => setSelectedType('expense')}
        >
          <FontAwesome5 
            name="arrow-up" 
            size={14} 
            color={selectedType === 'expense' ? '#fff' : theme.colors.danger} 
          />
          <Text style={[
            styles.typeText,
            selectedType === 'expense' && styles.typeTextActive
          ]}>
            Despesa
          </Text>
        </TouchableOpacity>
      </View>

      {/* Seletor de ícones */}
      <Text style={styles.sectionTitle}>Escolha um ícone</Text>
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
              selectedIcon === icon && styles.iconButtonActive
            ]}
            onPress={() => setSelectedIcon(icon)}
          >
            <FontAwesome5 
              name={icon} 
              size={20} 
              color={selectedIcon === icon ? '#fff' : theme.colors.textMuted} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input para nova categoria */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="Nome da categoria"
          placeholderTextColor={theme.colors.textMuted}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de categorias */}
      <ScrollView style={styles.list}>
        {(selectedType === 'expense' ? expenseCategories : incomeCategories).map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <FontAwesome5 
                name={category.icon || 'tag'} 
                size={16} 
                color={selectedType === 'income' ? theme.colors.success : theme.colors.danger} 
              />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteCategory(category.id)}>
              <FontAwesome5 name="trash" size={16} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    marginBottom: 20,
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
    backgroundColor: theme.colors.darkLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  typeTextActive: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.darkLight,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  list: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
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
    backgroundColor: theme.colors.darkLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
});