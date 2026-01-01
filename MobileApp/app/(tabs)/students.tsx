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
import { studentService, Student } from '../../src/services/studentService';
import { useAuth } from '../../src/context/AuthContext';

export default function StudentsScreen() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    class: '',
    section: '',
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setError('');
      const data = await studentService.getAll();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        student.class.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const openModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section,
        phone: student.phone,
        address: student.address,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        rollNumber: '',
        class: '',
        section: '',
        phone: '',
        address: '',
        parentName: '',
        parentPhone: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingStudent(null);
  };

  const handleSave = async () => {
    try {
      if (editingStudent) {
        await studentService.update(editingStudent._id, formData);
        Alert.alert('Success', 'Student updated successfully');
      } else {
        await studentService.create(formData);
        Alert.alert('Success', 'Student added successfully');
      }
      closeModal();
      fetchStudents();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save student');
    }
  };

  const handleDelete = (student: Student) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${student.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await studentService.delete(student._id);
              Alert.alert('Success', 'Student deleted successfully');
              fetchStudents();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete student');
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
    return <ErrorState message={error} onRetry={fetchStudents} />;
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search students..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentDetail}>{item.email}</Text>
                  <View style={styles.chipContainer}>
                    <Chip style={styles.chip} compact>
                      {item.rollNumber}
                    </Chip>
                    <Chip style={styles.chip} compact>
                      {item.class}-{item.section}
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
            icon="account-group"
            title="No Students"
            message="No students found. Add your first student to get started."
            actionLabel="Add Student"
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
            {editingStudent ? 'Edit Student' : 'Add Student'}
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
              label="Roll Number"
              value={formData.rollNumber}
              onChangeText={(text) => setFormData({ ...formData, rollNumber: text })}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />

            <TextInput
              label="Class"
              value={formData.class}
              onChangeText={(text) => setFormData({ ...formData, class: text })}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Section"
              value={formData.section}
              onChangeText={(text) => setFormData({ ...formData, section: text })}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />

            <TextInput
              label="Phone"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              mode="outlined"
              keyboardType="phone-pad"
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

          <TextInput
            label="Parent Name"
            value={formData.parentName}
            onChangeText={(text) => setFormData({ ...formData, parentName: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Parent Phone"
            value={formData.parentPhone}
            onChangeText={(text) => setFormData({ ...formData, parentPhone: text })}
            mode="outlined"
            keyboardType="phone-pad"
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
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 28,
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
