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
  ProgressBar,
} from 'react-native-paper';
import { Loading, EmptyState, ErrorState } from '../../src/components';
import { gradeService } from '../../src/services/gradeService';
import { useAuth } from '../../src/context/AuthContext';

export default function GradesScreen() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchGrades();
    }
  }, [user]);

  const fetchGrades = async () => {
    try {
      setError('');
      const data = await gradeService.getByStudent(user?.id || '');
      setGrades(data);
    } catch (error: any) {
      console.error('Error fetching grades:', error);
      setError('Failed to load grades');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGrades();
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#4caf50';
    if (percentage >= 75) return '#8bc34a';
    if (percentage >= 60) return '#ff9800';
    if (percentage >= 50) return '#ff5722';
    return '#f44336';
  };

  const calculatePercentage = (marks: number, totalMarks: number) => {
    return (marks / totalMarks) * 100;
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => {
      return sum + calculatePercentage(grade.marks, grade.totalMarks);
    }, 0);
    return (total / grades.length).toFixed(1);
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorState message={error} onRetry={fetchGrades} />;
  }

  return (
    <View style={styles.container}>
      {grades.length > 0 && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Overall Performance</Text>
            <Text style={styles.averageText}>{calculateAverage()}%</Text>
            <ProgressBar
              progress={parseFloat(calculateAverage()) / 100}
              color="#667eea"
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>
      )}

      <FlatList
        data={grades}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const percentage = calculatePercentage(item.marks, item.totalMarks);
          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.gradeInfo}>
                    <Text style={styles.subject}>{item.subject}</Text>
                    <Text style={styles.examType}>{item.examType}</Text>
                    <View style={styles.chipContainer}>
                      <Chip
                        style={[
                          styles.chip,
                          { backgroundColor: getGradeColor(percentage) + '20' },
                        ]}
                        textStyle={{ color: getGradeColor(percentage) }}
                      >
                        {item.grade}
                      </Chip>
                      <Chip style={styles.chip} compact>
                        {item.marks}/{item.totalMarks}
                      </Chip>
                      <Chip style={styles.chip} compact>
                        {percentage.toFixed(1)}%
                      </Chip>
                    </View>
                    <Text style={styles.date}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                    {item.remarks && (
                      <Text style={styles.remarks}>Remarks: {item.remarks}</Text>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="trophy"
            title="No Grades"
            message="No grades have been assigned yet."
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
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  averageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gradeInfo: {
    flex: 1,
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examType: {
    fontSize: 14,
    color: '#666',
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
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  remarks: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
