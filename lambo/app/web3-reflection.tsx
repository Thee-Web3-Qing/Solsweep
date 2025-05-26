import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function Web3ReflectionScreen() {
  const [past, setPast] = useState('');
  const [current, setCurrent] = useState('');
  const [future, setFuture] = useState('');
  const router = useRouter();

  const handleNext = () => {
    // TODO: Save reflection data
    router.replace('./add-wallet');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Web3 Reflection</Text>
      <TextInput
        style={styles.input}
        placeholder="Past Web3 actions"
        value={past}
        onChangeText={setPast}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Current efforts"
        value={current}
        onChangeText={setCurrent}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Future (uncertain) aspirations"
        value={future}
        onChangeText={setFuture}
        multiline
      />
      <Button title="Next" onPress={handleNext} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButtonText: { color: '#007AFF', fontWeight: 'bold', marginLeft: 4, fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16, minHeight: 48 },
}); 