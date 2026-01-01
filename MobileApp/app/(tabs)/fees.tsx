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
  Chip,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { Loading, EmptyState, ErrorState } from '../../src/components';
import { feeService } from '../../src/services/feeService';
import { useAuth } from '../../src/context/AuthContext';

export default function FeesScreen() {
  const { user } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    dueDate: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      fetchFees();
    }
  }, [user]);

  const fetchFees = async () => {
    try {
      setError('');
      let data;
      if (user?.role === 'student' || user?.role === 'parent') {
        data = await feeService.getByStudent(user.id);
      } else {
        data = await feeService.getAll();
      }
      setFees(data);
    } catch (error: any) {
      console.error('Error fetching fees:', error);
      setError('Failed to load fees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFees();
  };

  const handleMarkAsPaid = async (feeId: string) => {
    try {
      await feeService.markAsPaid(feeId);
      Alert.alert('Success', 'Fee marked as paid');
      fetchFees();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to mark fee as paid');
    }
  };

  const openModal = () => {
    setFormData({
      studentId: '',
      amount: '',
      dueDate: '',
      category: '',
      description: '',
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
        amount: parseFloat(formData.amount),
      };

      await feeService.create(dataToSave);
      Alert.alert('Success', 'Fee record created successfully');
      closeModal();
      fetchFees();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create fee record');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'overdue':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const calculateTotals = () => {
    const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paid = fees
      .filter((fee) => fee.status === 'paid')
      .reduce((sum, fee) => sum + fee.amount, 0);
    const pending = total - paid;
    return { total, paid, pending };
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorState message={error} onRetry={fetchFees} />;
  }

  const totals = calculateTotals();

  return (
    <View style={styles.container}>
      {fees.length > 0 && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Fee Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>${totals.total.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Paid</Text>
                <Text style={[styles.summaryValue, { color: '#4caf50' }]}>
                  ${totals.paid.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={[styles.summaryValue, { color: '#ff9800' }]}>
                  ${totals.pending.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      <FlatList
        data={fees}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.feeInfo}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                  <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
                  <View style={styles.chipContainer}>
                    <Chip
                      style={[
                        styles.chip,
                        { backgroundColor: getStatusColor(item.status) + '20' },
                      ]}
                      textStyle={{ color: getStatusColor(item.status) }}
                    >
                      {item.status.toUpperCase()}
                    </Chip>
                    <Chip style={styles.chip} compact icon="calendar">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </Chip>
                  </View>
                  {item.paymentDate && (
                    <Text style={styles.paymentDate}>
                      Paid on: {new Date(item.paymentDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
              {item.status !== 'paid' && (user?.role === 'staff' || user?.role === 'admin') && (
                <Button
                  mode="contained"
                  onPress={() => handleMarkAsPaid(item._id)}
                  style={styles.payButton}
                  compact
                >
                  Mark as Paid
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="cash"
            title="No Fee Records"
            message="No fee records found."
            actionLabel={
              user?.role === 'staff' || user?.role === 'admin'
                ? 'Add Fee Record'
                : undefined
            }
            onAction={
              user?.role === 'staff' || user?.role === 'admin'
                ? openModal
                : undefined
            }
          />
        }
      />

      {(user?.role === 'staff' || user?.role === 'admin') && (
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
              <Text style={styles.modalTitle}>Add Fee Record</Text>

              <TextInput
                label="Student ID"
                value={formData.studentId}
                onChangeText={(text) => setFormData({ ...formData, studentId: text })}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Category"
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                mode="outlined"
                placeholder="Tuition, Books, etc."
                style={styles.input}
              />

              <TextInput
                label="Amount"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />

              <TextInput
                label="Due Date (YYYY-MM-DD)"
                value={formData.dueDate}
                onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                mode="outlined"
                placeholder="2024-12-31"
                style={styles.input}
              />

              <TextInput
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
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
  summaryCard: {
    margin: 16,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  feeInfo: {
    flex: 1,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
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
  paymentDate: {
    fontSize: 12,
    color: '#4caf50',
    marginTop: 4,
  },
  payButton: {
    marginTop: 8,
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
