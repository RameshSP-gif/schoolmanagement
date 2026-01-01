import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Chip,
  RadioButton,
  Portal,
  Modal,
} from 'react-native-paper';
import { Loading, EmptyState, ErrorState } from '../../src/components';
import { attendanceService } from '../../src/services/attendanceService';
import { classService } from '../../src/services/classService';
import { useAuth } from '../../src/context/AuthContext';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user?.role === 'teacher' || user?.role === 'parent') {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setError('');
      if (user?.role === 'teacher') {
        const classesData = await classService.getAll();
        setClasses(classesData);
        if (classesData.length > 0) {
          setSelectedClass(classesData[0]);
        }
      } else if (user?.role === 'parent') {
        // Load children's attendance
        const attendanceData = await attendanceService.getByStudent(user.id);
        setStudents(attendanceData);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInitialData();
  };

  const handleMarkAttendance = async () => {
    if (!selectedClass) {
      Alert.alert('Error', 'Please select a class');
      return;
    }

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    if (records.length === 0) {
      Alert.alert('Error', 'Please mark attendance for at least one student');
      return;
    }

    try {
      await attendanceService.markAttendance({
        classId: selectedClass._id,
        date: selectedDate,
        records,
      });
      Alert.alert('Success', 'Attendance marked successfully');
      setAttendance({});
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#4caf50';
      case 'absent':
        return '#f44336';
      case 'late':
        return '#ff9800';
      case 'excused':
        return '#2196f3';
      default:
        return '#999';
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !refreshing) {
    return <ErrorState message={error} onRetry={loadInitialData} />;
  }

  if (user?.role === 'parent') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {students.length === 0 ? (
          <EmptyState
            icon="calendar-check"
            title="No Attendance Records"
            message="No attendance records found for your children."
          />
        ) : (
          students.map((record, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(record.status) + '20' },
                  ]}
                  textStyle={{ color: getStatusColor(record.status) }}
                >
                  {record.status.toUpperCase()}
                </Chip>
                {record.remarks && (
                  <Text style={styles.remarks}>Remarks: {record.remarks}</Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    );
  }

  if (user?.role === 'teacher') {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Select Class:</Text>
              {classes.map((cls) => (
                <List.Item
                  key={cls._id}
                  title={`${cls.name} - ${cls.section}`}
                  left={(props) => <List.Icon {...props} icon="google-classroom" />}
                  onPress={() => setSelectedClass(cls)}
                  style={
                    selectedClass?._id === cls._id
                      ? styles.selectedClass
                      : undefined
                  }
                />
              ))}
            </Card.Content>
          </Card>

          {selectedClass && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>
                  Mark Attendance - {selectedClass.name} {selectedClass.section}
                </Text>
                <Text style={styles.date}>Date: {selectedDate}</Text>

                <View style={styles.studentsContainer}>
                  {selectedClass.students?.map((student: any, index: number) => (
                    <View key={index} style={styles.studentRow}>
                      <Text style={styles.studentName}>
                        Student {index + 1}
                      </Text>
                      <RadioButton.Group
                        onValueChange={(value) =>
                          setAttendance({ ...attendance, [student]: value })
                        }
                        value={attendance[student] || ''}
                      >
                        <View style={styles.radioGroup}>
                          <View style={styles.radioItem}>
                            <RadioButton value="present" />
                            <Text>Present</Text>
                          </View>
                          <View style={styles.radioItem}>
                            <RadioButton value="absent" />
                            <Text>Absent</Text>
                          </View>
                          <View style={styles.radioItem}>
                            <RadioButton value="late" />
                            <Text>Late</Text>
                          </View>
                        </View>
                      </RadioButton.Group>
                    </View>
                  ))}
                </View>

                <Button
                  mode="contained"
                  onPress={handleMarkAttendance}
                  style={styles.submitButton}
                  icon="check"
                >
                  Submit Attendance
                </Button>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Attendance view not available for your role.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedClass: {
    backgroundColor: '#667eea20',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  studentsContainer: {
    marginTop: 16,
  },
  studentRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  remarks: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
