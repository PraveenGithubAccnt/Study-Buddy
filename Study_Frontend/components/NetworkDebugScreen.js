import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NetworkDebugScreen = () => {
  const [logs, setLogs] = useState([]);
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const checkNetworkState = async () => {
    addLog('Checking network state...');
    try {
      const networkState = await NetInfo.fetch();
      addLog(`Connected: ${networkState.isConnected}`);
      addLog(`Internet Reachable: ${networkState.isInternetReachable}`);
      addLog(`Connection Type: ${networkState.type}`);
      addLog(`Network Details: ${JSON.stringify(networkState.details)}`);
    } catch (error) {
      addLog(`Network check failed: ${error.message}`);
    }
  };

  const testInternetConnection = async () => {
    addLog('Testing basic internet connection...');
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        timeout: 10000,
      });
      addLog(`✅ Internet test successful: ${response.status}`);
      const data = await response.json();
      addLog(`Response: ${JSON.stringify(data.origin)}`);
    } catch (error) {
      addLog(`❌ Internet test failed: ${error.message}`);
    }
  };

  const testYourServer = async () => {
    addLog('Testing your server (192.168.29.93:3000)...');
    try {
      const response = await fetch('http://192.168.29.93:3000', {
        method: 'GET',
        timeout: 15000,
      });
      addLog(`✅ Server responded: ${response.status}`);
      const text = await response.text();
      addLog(`Server response: ${text.substring(0, 200)}...`);
    } catch (error) {
      addLog(`❌ Server test failed: ${error.message}`);
      addLog(`Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    }
  };

  const testYourAPI = async () => {
    addLog('Testing your API endpoint...');
    try {
      const response = await fetch('http://192.168.29.93:3000/api/auth', {
        method: 'GET',
        timeout: 15000,
      });
      addLog(`✅ API responded: ${response.status}`);
      const data = await response.json();
      addLog(`API response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      addLog(`❌ API test failed: ${error.message}`);
      addLog(`Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    }
  };

  const testLogin = async () => {
    addLog('Testing login request...');
    try {
      const response = await fetch('http://192.168.29.93:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        }),
        timeout: 15000,
      });
      addLog(`Login request status: ${response.status}`);
      const responseText = await response.text();
      addLog(`Login response: ${responseText}`);
    } catch (error) {
      addLog(`❌ Login test failed: ${error.message}`);
      addLog(`Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    }
  };

  const runAllTests = async () => {
    addLog('=== RUNNING ALL NETWORK TESTS ===');
    await checkNetworkState();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testInternetConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testYourServer();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testYourAPI();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testLogin();
    addLog('=== ALL TESTS COMPLETED ===');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Debug Screen</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="🔄 Run All Tests" 
          onPress={runAllTests}
          color="#FF6B35"
        />
        
        <Button 
          title="Check Network State" 
          onPress={checkNetworkState}
          color="#007AFF"
        />
        
        <Button 
          title="Test Internet" 
          onPress={testInternetConnection}
          color="#34C759"
        />
        
        <Button 
          title="Test Your Server" 
          onPress={testYourServer}
          color="#FF9500"
        />
        
        <Button 
          title="Test Your API" 
          onPress={testYourAPI}
          color="#5856D6"
        />
        
        <Button 
          title="Test Login" 
          onPress={testLogin}
          color="#AF52DE"
        />
      </View>
      
      <ScrollView style={styles.logsContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
      
      <Button 
        title="Clear Logs" 
        onPress={() => setLogs([])}
        color="#FF3B30"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  logText: {
    fontSize: 12,
    marginBottom: 3,
    fontFamily: 'monospace',
  },
});

export default NetworkDebugScreen;