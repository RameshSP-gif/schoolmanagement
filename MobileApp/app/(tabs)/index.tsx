import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { StatCard, Loading, ErrorState } from '../../src/components';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import api from '../../src/services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const [studentsRes, teachersRes, classesRes, feesRes] = await Promise.all([
        api.get('/students'),
        api.get('/teachers'),
        api.get('/classes'),
        api.get('/fees'),
      ]);

      const paidFees = feesRes.data.filter((fee: any) => fee.status === 'paid');
      const totalRevenue = paidFees.reduce((sum: number, fee: any) => sum + fee.amount, 0);

      setStats({
        totalStudents: studentsRes.data.length,
        totalTeachers: teachersRes.data.length,
        totalClasses: classesRes.data.length,
        totalRevenue,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
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
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Text style={styles.welcomeText}>Welcome back, {user?.name}!</Text>
          <Text style={styles.roleText}>Administrator</Text>
        </Card.Content>
      </Card>

      <View style={styles.statsContainer}>
        <View style={styles.row}>
          <View style={styles.statWrapper}>
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon="account-group"
              colors={['#667eea', '#764ba2']}
              onPress={() => router.push('/(tabs)/students')}
            />
          </View>
          <View style={styles.statWrapper}>
            <StatCard
              title="Total Teachers"
              value={stats.totalTeachers}
              icon="account-tie"
              colors={['#f093fb', '#f5576c']}
              onPress={() => router.push('/(tabs)/teachers')}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.statWrapper}>
            <StatCard
              title="Total Classes"
              value={stats.totalClasses}
              icon="google-classroom"
              colors={['#4facfe', '#00f2fe']}
              onPress={() => router.push('/(tabs)/classes')}
            />
          </View>
          <View style={styles.statWrapper}>
            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon="cash"
              colors={['#43e97b', '#38f9d7']}
            />
          </View>
        </View>
      </View>

      <Card style={styles.actionCard}>
        <Card.Content>
          <Text style={styles.actionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="account-plus"
              onPress={() => router.push('/(tabs)/students')}
              style={styles.actionButton}
            >
              Add Student
            </Button>
            <Button
              mode="contained"
              icon="account-tie"
              onPress={() => router.push('/(tabs)/teachers')}
              style={styles.actionButton}
            >
              Add Teacher
            </Button>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => router.push('/(tabs)/classes')}
              style={styles.actionButton}
            >
              Add Class
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
      >
        Logout
      </Button>
    </ScrollView>
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
  welcomeCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  statWrapper: {
    flex: 1,
    paddingHorizontal: 8,
  },
  actionCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});
