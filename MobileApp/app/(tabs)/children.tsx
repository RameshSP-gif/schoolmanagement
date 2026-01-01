import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Avatar,
  Chip,
  Button,
} from 'react-native-paper';
import { Loading, EmptyState, ErrorState } from '../../src/components';
import { studentService } from '../../src/services/studentService';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';

export default function ChildrenScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'parent') {
      fetchChildren();
    }
  }, [user]);

  const fetchChildren = async () => {
    try {
      setError('');
      // In a real app, fetch children for the specific parent
      const data = await studentService.getAll();
      // Filter children associated with this parent
      setChildren(data.slice(0, 3)); // Demo: show first 3 students
    } catch (error: any) {
      console.error('Error fetching children:', error);
      setError('Failed to load children');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChildren();
  };

  if (user?.role !== 'parent') {
    return (
      <View style={styles.container}>
        <Text>This screen is only available for parents.</Text>
      </View>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorState message={error} onRetry={fetchChildren} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={children}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Avatar.Text
                  size={56}
                  label={item.name.substring(0, 2).toUpperCase()}
                  style={styles.avatar}
                />
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{item.name}</Text>
                  <Text style={styles.childDetail}>{item.email}</Text>
                  <View style={styles.chipContainer}>
                    <Chip style={styles.chip} compact icon="identifier">
                      {item.rollNumber}
                    </Chip>
                    <Chip style={styles.chip} compact icon="google-classroom">
                      {item.class}-{item.section}
                    </Chip>
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.actionButton}
                  compact
                  icon="calendar-check"
                >
                  Attendance
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.actionButton}
                  compact
                  icon="trophy"
                >
                  Grades
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.actionButton}
                  compact
                  icon="cash"
                >
                  Fees
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="human-male-child"
            title="No Children"
            message="No children associated with your account."
          />
        }
      />
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
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#667eea',
    marginRight: 16,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  childDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
});
