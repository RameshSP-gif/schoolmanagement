import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

export default function TabsLayout() {
  const { user } = useAuth();

  // Define tabs based on user role
  const getTabsForRole = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'index', title: 'Dashboard', icon: 'view-dashboard' },
          { name: 'students', title: 'Students', icon: 'account-group' },
          { name: 'teachers', title: 'Teachers', icon: 'account-tie' },
          { name: 'classes', title: 'Classes', icon: 'google-classroom' },
          { name: 'profile', title: 'Profile', icon: 'account' },
        ];
      case 'teacher':
        return [
          { name: 'index', title: 'Dashboard', icon: 'view-dashboard' },
          { name: 'classes', title: 'My Classes', icon: 'google-classroom' },
          { name: 'assignments', title: 'Assignments', icon: 'file-document' },
          { name: 'attendance', title: 'Attendance', icon: 'calendar-check' },
          { name: 'profile', title: 'Profile', icon: 'account' },
        ];
      case 'student':
        return [
          { name: 'index', title: 'Dashboard', icon: 'view-dashboard' },
          { name: 'courses', title: 'Courses', icon: 'book-open' },
          { name: 'assignments', title: 'Assignments', icon: 'file-document' },
          { name: 'grades', title: 'Grades', icon: 'trophy' },
          { name: 'profile', title: 'Profile', icon: 'account' },
        ];
      case 'parent':
        return [
          { name: 'index', title: 'Dashboard', icon: 'view-dashboard' },
          { name: 'children', title: 'Children', icon: 'human-male-child' },
          { name: 'attendance', title: 'Attendance', icon: 'calendar-check' },
          { name: 'fees', title: 'Fees', icon: 'cash' },
          { name: 'profile', title: 'Profile', icon: 'account' },
        ];
      case 'staff':
        return [
          { name: 'index', title: 'Dashboard', icon: 'view-dashboard' },
          { name: 'admissions', title: 'Admissions', icon: 'account-plus' },
          { name: 'fees', title: 'Fee Collection', icon: 'cash-register' },
          { name: 'visitors', title: 'Visitors', icon: 'account-supervisor' },
          { name: 'profile', title: 'Profile', icon: 'account' },
        ];
      default:
        return [
          { name: 'index', title: 'Dashboard', icon: 'view-dashboard' },
          { name: 'profile', title: 'Profile', icon: 'account' },
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name={tab.icon as any} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
