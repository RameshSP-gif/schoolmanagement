import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  console.log('📍 Index screen render');
  console.log('   - Loading:', loading);
  console.log('   - Authenticated:', isAuthenticated);  
  console.log('   - User:', user?.email || 'none');

  useEffect(() => {
    console.log('📍 Index useEffect triggered');
    console.log('   - Loading:', loading);
    console.log('   - Authenticated:', isAuthenticated);
    
    if (!loading) {
      console.log('🚀 Navigation decision - Auth:', isAuthenticated);
      if (isAuthenticated) {
        console.log('➡️ Navigating to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('➡️ Navigating to login');
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  // Simple fallback UI that's always visible
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={styles.text}>
        {loading ? 'Checking authentication...' : 'Redirecting...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
