import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { API_CONFIG } from '../config/api.config';
import axios from 'axios';

export const ApiTestScreen = () => {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');

  const checkConnection = async () => {
    setStatus('checking');
    setMessage('Checking connection...');

    try {
      const response = await axios.get(`${API_CONFIG.baseURL.replace('/api', '')}/health`, {
        timeout: 5000,
      });
      setStatus('success');
      setMessage(`✅ Connected to backend!\n\nURL: ${API_CONFIG.baseURL}\nStatus: ${response.status}`);
    } catch (error: any) {
      setStatus('error');
      let errorMsg = '❌ Cannot connect to backend\n\n';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg += 'Connection timeout. Server might be down.';
      } else if (error.message === 'Network Error') {
        errorMsg += 'Network error. Check:\n\n';
        errorMsg += '1. Backend is running on port 5000\n';
        errorMsg += '2. Using correct URL:\n   ' + API_CONFIG.baseURL + '\n';
        errorMsg += '3. Android emulator? Use 10.0.2.2\n';
        errorMsg += '4. Physical device? Use your PC IP';
      } else {
        errorMsg += `Error: ${error.message}`;
      }
      
      setMessage(errorMsg);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Backend Connection Test</Text>
          
          {status === 'checking' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" />
              <Text style={styles.message}>{message}</Text>
            </View>
          )}

          {status === 'success' && (
            <View style={styles.center}>
              <Text style={[styles.message, styles.success]}>{message}</Text>
            </View>
          )}

          {status === 'error' && (
            <View style={styles.center}>
              <Text style={[styles.message, styles.error]}>{message}</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={checkConnection}
            style={styles.button}
            icon="refresh"
          >
            Test Again
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  center: {
    alignItems: 'center',
    marginVertical: 20,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  success: {
    color: '#4caf50',
  },
  error: {
    color: '#f44336',
  },
  button: {
    marginTop: 20,
  },
});
