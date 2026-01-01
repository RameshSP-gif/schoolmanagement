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
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  Chip,
  IconButton,
} from 'react-native-paper';
import { Loading, EmptyState, ErrorState } from '../../src/components';
import { assignmentService, Assignment } from '../../src/services/assignmentService';
import { useAuth } from '../../src/context/AuthContext';

export default function AssignmentsScreen() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    totalMarks: '',
  });

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setError('');
      let data;
      if (user?.role === 'teacher') {
        data = await assignmentService.getAll();
      } else if (user?.role === 'student') {
        data = await assignmentService.getByStudent(user.id);
      } else {
        data = await assignmentService.getAll();
      }
      setAssignments(data);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const openModal = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      dueDate: '',
      totalMarks: '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        totalMarks: parseInt(formData.totalMarks),
        teacherId: user?.id,
      };

      await assignmentService.create(dataToSave);
      Alert.alert('Success', 'Assignment created successfully');
      closeModal();
      fetchAssignments();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleDelete = (assignment: Assignment) => {
    Alert.alert(
      'Delete Assignment',
      `Are you sure you want to delete "${assignment.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await assignmentService.delete(assignment._id);
              Alert.alert('Success', 'Assignment deleted successfully');
              fetchAssignments();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete assignment');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return '#f44336';
    if (due.getTime() - now.getTime() < 86400000 * 3) return '#ff9800';
    return '#4caf50';
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorState message={error} onRetry={fetchAssignments} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={assignments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.assignmentInfo}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.chipContainer}>
                    <Chip
                      style={styles.chip}
                      compact
                      icon="book"
                    >
                      {item.subject}
                    </Chip>
                    <Chip
                      style={[styles.chip, { backgroundColor: getStatusColor(item.dueDate) + '20' }]}
                      compact
                      icon="calendar"
                      textStyle={{ color: getStatusColor(item.dueDate) }}
                    >
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </Chip>
                    <Chip style={styles.chip} compact icon="trophy">
                      {item.totalMarks} marks
                    </Chip>
                  </View>
                  {user?.role === 'teacher' && (
                    <Text style={styles.submissionCount}>
                      Submissions: {item.submissions?.length || 0}
                    </Text>
                  )}
                </View>
                {user?.role === 'teacher' && (
                  <View style={styles.actions}>
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
            icon="file-document"
            title="No Assignments"
            message={
              user?.role === 'teacher'
                ? 'No assignments created yet. Create one to get started.'
                : 'No assignments assigned to you yet.'
            }
            actionLabel={user?.role === 'teacher' ? 'Create Assignment' : undefined}
            onAction={user?.role === 'teacher' ? openModal : undefined}
          />
        }
      />

      {user?.role === 'teacher' && (
        <>
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={openModal}
          />

          <Portal>
            <Modal
              visible={modalVisible}
              onDismiss={closeModal}
              contentContainerStyle={styles.modal}
            >
              <Text style={styles.modalTitle}>Create Assignment</Text>

              <TextInput
                label="Title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <TextInput
                label="Subject"
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
                mode="outlined"
                style={styles.input}
              />

              <View style={styles.row}>
                <TextInput
                  label="Due Date (YYYY-MM-DD)"
                  value={formData.dueDate}
                  onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                  mode="outlined"
                  placeholder="2024-12-31"
                  style={[styles.input, styles.halfInput]}
                />

                <TextInput
                  label="Total Marks"
                  value={formData.totalMarks}
                  onChangeText={(text) => setFormData({ ...formData, totalMarks: text })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
              </View>

              <View style={styles.modalActions}>
                <Button onPress={closeModal} mode="outlined">
                  Cancel
                </Button>
                <Button onPress={handleSave} mode="contained">
                  Create
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
  card: {
    margin: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assignmentInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    height: 28,
  },
  submissionCount: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
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
