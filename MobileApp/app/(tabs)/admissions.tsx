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
} from 'react-native-paper';
import { Loading, EmptyState, ErrorState } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';

export default function AdmissionsScreen() {
  const { user } = useAuth();
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
  });

  useEffect(() => {
    if (user?.role === 'staff') {
      fetchAdmissions();
    }
  }, [user]);

  const fetchAdmissions = async () => {
    try {
      setError('');
      const response = await api.get('/admissions');
      setAdmissions(response.data || []);
    } catch (error: any) {
      console.error('Error fetching admissions:', error);
      setError('Failed to load admissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdmissions();
  };

  const openModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      class: '',
      guardianName: '',
      guardianPhone: '',
      address: '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSave = async () => {
    try {
      await api.post('/admissions', formData);
      Alert.alert('Success', 'Admission application submitted successfully');
      closeModal();
      fetchAdmissions();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit admission');
    }
  };

  if (user?.role !== 'staff') {
    return (
      <View style={styles.container}>
        <Text>This screen is only available for staff.</Text>
      </View>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorState message={error} onRetry={fetchAdmissions} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={admissions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>{item.email}</Text>
              <Text style={styles.detail}>{item.phone}</Text>
              <View style={styles.chipContainer}>
                <Chip style={styles.chip} compact icon="google-classroom">
                  {item.class}
                </Chip>
                <Chip
                  style={styles.chip}
                  compact
                  icon="check-circle"
                  textStyle={{ color: item.status === 'approved' ? '#4caf50' : '#ff9800' }}
                >
                  {item.status || 'Pending'}
                </Chip>
              </View>
              <Text style={styles.detail}>
                Guardian: {item.guardianName} ({item.guardianPhone})
              </Text>
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="account-plus"
            title="No Admissions"
            message="No admission applications found."
            actionLabel="New Application"
            onAction={openModal}
          />
        }
      />

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
          <Text style={styles.modalTitle}>New Admission Application</Text>

          <TextInput
            label="Student Name"
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
              label="Class"
              value={formData.class}
              onChangeText={(text) => setFormData({ ...formData, class: text })}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <TextInput
            label="Guardian Name"
            value={formData.guardianName}
            onChangeText={(text) => setFormData({ ...formData, guardianName: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Guardian Phone"
            value={formData.guardianPhone}
            onChangeText={(text) => setFormData({ ...formData, guardianPhone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

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
              Submit
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
  card: {
    margin: 16,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  chip: {
    height: 28,
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
