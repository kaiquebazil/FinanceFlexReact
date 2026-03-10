import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useData } from '../../hooks/useData';
import { Button } from '../ui/Button';

interface CategoryManagerProps {
  onClose: () => void;
}

export function CategoryManager({ onClose }: CategoryManagerProps) {
  const { categories, addCategory, deleteCategory } = useData();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({ name: newCategoryName.trim(), type: 'expense', icon: 'tag' });
      setNewCategoryName('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nova categoria"
          placeholderTextColor={theme.colors.textDim}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
        />
        <Button title="Adicionar" onPress={handleAddCategory} style={styles.addButton} />
      </View>
      <View style={styles.list}>
        {categories.map((category) => (
          <View key={category.id} style={styles.item}>
            <View style={styles.itemInfo}>
              <FontAwesome5 name="tag" size={14} color={theme.colors.primary} />
              <Text style={styles.itemText}>{category.name}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteCategory(category.id)} style={styles.deleteButton}>
              <FontAwesome5 name="trash" size={14} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputContainer: { marginBottom: 20 },
  input: { backgroundColor: theme.colors.darkLight, borderRadius: 8, padding: 12, color: theme.colors.text, marginBottom: 12 },
  addButton: { width: '100%' },
  list: { gap: 8 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: theme.colors.darkLight, borderRadius: 8 },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemText: { fontSize: 15, fontFamily: 'Inter-Medium', color: theme.colors.text },
  deleteButton: { padding: 8 },
});
