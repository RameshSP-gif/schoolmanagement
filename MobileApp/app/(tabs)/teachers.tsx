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
  Chip,
} from 'react-native-paper';
import { Loading, EmptyState, ErrorState } from '../../src/components';
import { teacherService, Teacher } from '../../src/services/teacherService';
import { useAuth } from '../../src/context/AuthContext';

export default function TeachersScreen() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    subject: '',
    qualification: '',
    phone: '',
    address: '',
    salary: '',
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTeachers();
    }
  }, [user]);

  useEffect(() => {
    filterTeachers();
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    try {
      setError('');
      const data = await teacherService.getAll();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterTeachers = () => {
    if (!searchQuery) {
      setFilteredTeachers(teachers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        teacher.employeeId.toLowerCase().includes(query) ||
        teacher.subject.toLowerCase().includes(query)
    );
    setFilteredTeachers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeachers();
  };

  const openModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId,
        subject: teacher.subject,
        qualification: teacher.qualification,
        phone: teacher.phone,
        address: teacher.address,
        salary: teacher.salary.toString(),
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        name: '',
        email: '',
        employeeId: '',
        subject: '',
        qualification: '',
        phone: '',
        address: '',
        salary: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTeacher(null);
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        salary: parseFloat(formData.salary),
      };

      if (editingTeacher) {
        await teacherService.update(editingTeacher._id, dataToSave);
        Alert.alert('Success', 'Teacher updated successfully');
      } else {
        await teacherService.create(dataToSave);
        Alert.alert('Success', 'Teacher added successfully');
      }
      closeModal();
      fetchTeachers();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save teacher');
    }
  };

  const handleDelete = (teacher: Teacher) => {
    Alert.alert(
      'Delete Teacher',
      `Are you sure you want to delete ${teacher.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await teacherService.delete(teacher._id);
              Alert.alert('Success', 'Teacher deleted successfully');
              fetchTeachers();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete teacher');
            }
          },
        },
      ]
    );
  };

  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text>Access denied. Admin only.</Text>
      </View>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorState message={error} onRetry={fetchTeachers} />;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search teachers..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredTeachers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>{item.name}</Text>
                  <Text style={styles.teacherDetail}>{item.email}</Text>
                  <View style={styles.chipContainer}>
                    <Chip style={styles.chip} compact icon="identifier">
                      {item.employeeId}
                    </Chip>
                    <Chip style={styles.chip} compact icon="book">
                      {item.subject}
                    </Chip>
                  </View>
                </View>
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
              </View>
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="account-tie"
            title="No Teachers"
            message="No teachers found. Add your first teacher to get started."
            actionLabel="Add Teacher"
            onAction={() => openModal()}
          />
        }
      />

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
            {editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
          </Text>

          <TextInput
            label="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="Employee ID"
              value={formData.employeeId}
              onChangeText={(text) => setFormData({ ...formData, employeeId: text })}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />

            <TextInput
              label="Subject"
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <TextInput
            label="Qualification"
            value={formData.qualification}
            onChangeText={(text) => setFormData({ ...formData, qualification: text })}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="Phone"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              style={[styles.input, styles.halfInput]}
            />

            <TextInput
              label="Salary"
              value={formData.salary}
              onChangeText={(text) => setFormData({ ...formData, salary: text })}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <TextInput
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
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
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teacherDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    height: 28,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});
