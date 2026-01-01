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

export default function VisitorsScreen() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    purpose: '',
    personToMeet: '',
    idType: '',
    idNumber: '',
  });

  useEffect(() => {
    if (user?.role === 'staff') {
      fetchVisitors();
    }
  }, [user]);

  const fetchVisitors = async () => {
    try {
      setError('');
      const response = await api.get('/visitors');
      setVisitors(response.data || []);
    } catch (error: any) {
      console.error('Error fetching visitors:', error);
      setError('Failed to load visitors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVisitors();
  };

  const openModal = () => {
    setFormData({
      name: '',
      phone: '',
      purpose: '',
      personToMeet: '',
      idType: '',
      idNumber: '',
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSave = async () => {
    try {
      await api.post('/visitors', {
        ...formData,
        checkInTime: new Date().toISOString(),
      });
      Alert.alert('Success', 'Visitor registered successfully');
      closeModal();
      fetchVisitors();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to register visitor');
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
    return <ErrorState message={error} onRetry={fetchVisitors} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visitors}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.visitorInfo}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.detail}>{item.phone}</Text>
                  <Text style={styles.detail}>Purpose: {item.purpose}</Text>
                  <Text style={styles.detail}>To meet: {item.personToMeet}</Text>
                  <View style={styles.chipContainer}>
                    <Chip style={styles.chip} compact icon="identifier">
                      {item.idType}: {item.idNumber}
                    </Chip>
                    {item.checkInTime && (
                      <Chip style={styles.chip} compact icon="clock-in">
                        In: {new Date(item.checkInTime).toLocaleTimeString()}
                      </Chip>
                    )}
                    {item.checkOutTime && (
                      <Chip style={styles.chip} compact icon="clock-out">
                        Out: {new Date(item.checkOutTime).toLocaleTimeString()}
                      </Chip>
                    )}
                  </View>
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
            icon="account-supervisor"
            title="No Visitors"
            message="No visitor records found for today."
            actionLabel="Register Visitor"
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
          <Text style={styles.modalTitle}>Register Visitor</Text>

          <TextInput
            label="Visitor Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Purpose of Visit"
            value={formData.purpose}
            onChangeText={(text) => setFormData({ ...formData, purpose: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Person to Meet"
            value={formData.personToMeet}
            onChangeText={(text) => setFormData({ ...formData, personToMeet: text })}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              label="ID Type"
              value={formData.idType}
              onChangeText={(text) => setFormData({ ...formData, idType: text })}
              mode="outlined"
              placeholder="Driver License, Passport, etc."
              style={[styles.input, styles.halfInput]}
            />

            <TextInput
              label="ID Number"
              value={formData.idNumber}
              onChangeText={(text) => setFormData({ ...formData, idNumber: text })}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <View style={styles.modalActions}>
            <Button onPress={closeModal} mode="outlined">
              Cancel
            </Button>
            <Button onPress={handleSave} mode="contained">
              Register
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visitorInfo: {
    flex: 1,
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
    marginTop: 8,
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
