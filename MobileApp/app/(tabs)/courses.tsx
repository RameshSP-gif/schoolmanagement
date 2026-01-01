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
  Chip,
  Avatar,
} from 'react-native-paper';
import { Loading, EmptyState, ErrorState } from '../../src/components';
import { classService } from '../../src/services/classService';
import { useAuth } from '../../src/context/AuthContext';

export default function CoursesScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'student') {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setError('');
      // In a real app, fetch courses for the specific student
      const data = await classService.getAll();
      setCourses(data);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  if (user?.role !== 'student') {
    return (
      <View style={styles.container}>
        <Text>This screen is only available for students.</Text>
      </View>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorState message={error} onRetry={fetchCourses} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Avatar.Icon
                  size={48}
                  icon="book-open"
                  style={styles.avatar}
                />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>
                    {item.name} - {item.section}
                  </Text>
                  <Text style={styles.courseDetail}>
                    {item.subjects?.length || 0} subjects
                  </Text>
                  <View style={styles.chipContainer}>
                    <Chip style={styles.chip} compact icon="account-group">
                      {item.students?.length || 0} students
                    </Chip>
                    <Chip style={styles.chip} compact icon="chair-school">
                      {item.capacity} capacity
                    </Chip>
                  </View>
                </View>
              </View>
              {item.subjects && item.subjects.length > 0 && (
                <View style={styles.subjectsContainer}>
                  <Text style={styles.subjectsTitle}>Subjects:</Text>
                  <View style={styles.subjectsList}>
                    {item.subjects.map((subject: string, index: number) => (
                      <Chip
                        key={index}
                        style={styles.subjectChip}
                        mode="outlined"
                        compact
                      >
                        {subject}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="book-open"
            title="No Courses"
            message="You are not enrolled in any courses yet."
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
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseDetail: {
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
  subjectsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  subjectsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    marginBottom: 4,
  },
});
