import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Searchbar,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  IconButton,
} from 'react-native-paper';
import { Loading, EmptyState, ErrorState } from '../../src/components';
import { classService, Class } from '../../src/services/classService';
import { useAuth } from '../../src/context/AuthContext';

export default function ClassesScreen() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    capacity: '',
  });

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'teacher') {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, classes]);

  const fetchClasses = async () => {
    try {
      setError('');
      const data = await classService.getAll();
      setClasses(data);
      setFilteredClasses(data);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterClasses = () => {
    if (!searchQuery) {
      setFilteredClasses(classes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = classes.filter(
      (cls) =>
        cls.name.toLowerCase().includes(query) ||
        cls.section.toLowerCase().includes(query)
    );
    setFilteredClasses(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const openModal = (cls?: Class) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        name: cls.name,
        section: cls.section,
        capacity: cls.capacity.toString(),
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        section: '',
        capacity: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingClass(null);
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        capacity: parseInt(formData.capacity),
      };

      if (editingClass) {
        await classService.update(editingClass._id, dataToSave);
        Alert.alert('Success', 'Class updated successfully');
      } else {
        await classService.create(dataToSave);
        Alert.alert('Success', 'Class added successfully');
      }
      closeModal();
      fetchClasses();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save class');
    }
  };

  const handleDelete = (cls: Class) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete ${cls.name}-${cls.section}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await classService.delete(cls._id);
              Alert.alert('Success', 'Class deleted successfully');
              fetchClasses();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete class');
            }
          },
        },
      ]
    );
  };

  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return (
      <View style={styles.container}>
        <Text>Access denied.</Text>
      </View>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorState message={error} onRetry={fetchClasses} />;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search classes..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredClasses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>
                    {item.name} - {item.section}
                  </Text>
                  <Text style={styles.classDetail}>
                    Capacity: {item.students?.length || 0}/{item.capacity}
                  </Text>
                  <Text style={styles.classDetail}>
                    Subjects: {item.subjects?.length || 0}
                  </Text>
                </View>
                {user.role === 'admin' && (
                  <View style={styles.actions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => openModal(item)}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDelete(item)}
                    />
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="google-classroom"
            title="No Classes"
            message="No classes found. Add your first class to get started."
            actionLabel={user.role === 'admin' ? 'Add Class' : undefined}
            onAction={user.role === 'admin' ? () => openModal() : undefined}
          />
        }
      />

      {user.role === 'admin' && (
        <>
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => openModal()}
          />

          <Portal>
            <Modal
              visible={modalVisible}
              onDismiss={closeModal}
              contentContainerStyle={styles.modal}
            >
              <Text style={styles.modalTitle}>
                {editingClass ? 'Edit Class' : 'Add Class'}
              </Text>

              <TextInput
                label="Class Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Grade 10, Class 5"
              />

              <TextInput
                label="Section"
                value={formData.section}
                onChangeText={(text) => setFormData({ ...formData, section: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., A, B, C"
              />

              <TextInput
                label="Capacity"
                value={formData.capacity}
                onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                placeholder="Maximum number of students"
              />

              <View style={styles.modalActions}>
                <Button onPress={closeModal} mode="outlined">
                  Cancel
                </Button>
                <Button onPress={handleSave} mode="contained">
                  Save
                </Button>
              </View>
            </Modal>
          </Portal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});
