import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddWalletScreen() {
  const [wallet, setWallet] = useState('');
  const router = useRouter();

  const handleAdd = () => {
    // TODO: Save wallet address
    router.replace('./dashboard');
  };

  const handleSkip = () => {
    router.replace('./dashboard');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Add Watch Wallet</Text>
      <TextInput
        style={styles.input}
        placeholder="Solana Public Key (optional)"
        value={wallet}
        onChangeText={setWallet}
        autoCapitalize="none"
      />
      <Button title="Add Wallet" onPress={handleAdd} />
      <TouchableOpacity style={styles.linkButton} onPress={handleSkip}>
        <Text style={styles.linkButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, position: 'absolute', top: 24, left: 24 },
  backButtonText: { color: '#007AFF', fontWeight: 'bold', marginLeft: 4, fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', marginTop: 40 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  linkButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 12, marginTop: 16 },
  linkButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
}); 