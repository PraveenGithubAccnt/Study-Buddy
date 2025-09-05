import React from 'react';
import { View, StyleSheet } from 'react-native';
import NetworkDebugScreen from '../components/NetworkDebugScreen';

export default function NetworkDebugPage() {
  return (
    <View style={styles.container}>
      <NetworkDebugScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});