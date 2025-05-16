import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Goal = { item: string; price: string; deadline: string };
type DreamType = 'splurge' | 'essential' | 'moonshot';
type Dreams = {
  splurge: Goal[];
  essential: Goal[];
  moonshot: Goal[];
};

type NewGoalInputs = {
  [K in DreamType]: Goal;
};

type ShowInputState = {
  [K in DreamType]: boolean;
};

const initialDreams: Dreams = {
  splurge: [
    { item: 'House', price: '$100,000', deadline: 'December 8, 2025' },
  ],
  essential: [
    { item: 'Health Insurance', price: '$1,200', deadline: 'January 1, 2025' },
  ],
  moonshot: [
    { item: 'Private Jet', price: '$5,000,000', deadline: 'December 31, 2030' },
  ],
};

const dreamFields = [
  { key: 'splurge', label: 'The Splurge' },
  { key: 'essential', label: 'The Essential' },
  { key: 'moonshot', label: 'The Moonshot' },
] as const;

export default function YourDreamsScreen() {
  const [dreams, setDreams] = useState<Dreams>(initialDreams);
  const [newGoal, setNewGoal] = useState<NewGoalInputs>({
    splurge: { item: '', price: '', deadline: '' },
    essential: { item: '', price: '', deadline: '' },
    moonshot: { item: '', price: '', deadline: '' },
  });
  const [showInput, setShowInput] = useState<ShowInputState>({
    splurge: false,
    essential: false,
    moonshot: false,
  });
  const router = useRouter();

  const handleInputChange = (type: DreamType, field: keyof Goal, value: string) => {
    setNewGoal((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleAddGoal = (type: DreamType) => {
    setShowInput((prev) => ({ ...prev, [type]: true }));
  };

  const handleSaveGoal = (type: DreamType) => {
    const goal = newGoal[type];
    if (!goal.item || !goal.price || !goal.deadline) return;
    setDreams((prev) => ({
      ...prev,
      [type]: [...prev[type], goal],
    }));
    setNewGoal((prev) => ({
      ...prev,
      [type]: { item: '', price: '', deadline: '' },
    }));
    setShowInput((prev) => ({ ...prev, [type]: false }));
  };

  const handleCancel = (type: DreamType) => {
    setNewGoal((prev) => ({ ...prev, [type]: { item: '', price: '', deadline: '' } }));
    setShowInput((prev) => ({ ...prev, [type]: false }));
  };

  const handleNext = () => {
    // TODO: Save dreams to storage or context
    router.replace('../web3-reflection');
  };

  return (
    <LinearGradient colors={['#e0f2ff', '#fff']} style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Dreams</Text>
        <View style={{ height: 16 }} />
        {dreamFields.map(({ key, label }) => (
          <View key={key} style={styles.dreamBlock}>
            <View style={styles.dreamLabelRow}>
              <Text style={styles.dreamLabel}>{label}</Text>
              <TouchableOpacity onPress={() => handleAddGoal(key)}>
                <Ionicons name="add-circle" size={22} color="#007AFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
            {/* Existing goals */}
            {dreams[key].map((goal, idx) => (
              <View key={idx} style={styles.existingGoal}>
                <Text style={styles.goalText}><Text style={styles.goalField}>Item:</Text> {goal.item}</Text>
                <Text style={styles.goalText}><Text style={styles.goalField}>Target:</Text> {goal.price}</Text>
                <Text style={styles.goalText}><Text style={styles.goalField}>Deadline:</Text> {goal.deadline}</Text>
              </View>
            ))}
            {/* Input fields for new goal, only show if plus was clicked */}
            {showInput[key] && (
              <View style={styles.inputBlock}>
                <TextInput
                  style={styles.input}
                  placeholder="Item"
                  value={newGoal[key].item}
                  onChangeText={(v) => handleInputChange(key, 'item', v)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Target"
                  value={newGoal[key].price}
                  onChangeText={(v) => handleInputChange(key, 'price', v)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Deadline"
                  value={newGoal[key].deadline}
                  onChangeText={(v) => handleInputChange(key, 'deadline', v)}
                />
                <View style={styles.inputButtonRow}>
                  <TouchableOpacity style={styles.blueButtonSmall} onPress={() => handleSaveGoal(key)}>
                    <Text style={styles.blueButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(key)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
        <View style={{ marginTop: 32 }}>
          <Text style={styles.placeholderTitle}>Example Goals</Text>
          <View style={styles.placeholderGoal}><Text>• Buy a Solana NFT (2 SOL, 3 months)</Text></View>
          <View style={styles.placeholderGoal}><Text>• Stake 10 SOL (10 SOL, 6 months)</Text></View>
          <View style={styles.placeholderGoal}><Text>• Save for a new phone (5 SOL, 1 year)</Text></View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 0, textAlign: 'center', marginTop: 24 },
  dreamBlock: { marginBottom: 24, backgroundColor: '#f7f7f7', borderRadius: 8, padding: 16 },
  dreamLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dreamLabel: { fontSize: 18, fontWeight: '600' },
  existingGoal: { backgroundColor: '#e0f7fa', borderRadius: 8, padding: 10, marginBottom: 8 },
  goalText: { fontSize: 15, marginBottom: 2 },
  goalField: { fontWeight: 'bold', color: '#007AFF' },
  inputBlock: { marginTop: 8, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  inputButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  blueButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, marginTop: 8 },
  blueButtonSmall: { backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, marginRight: 8 },
  blueButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { backgroundColor: '#eee', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  cancelButtonText: { color: '#007AFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  placeholderTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  placeholderGoal: { backgroundColor: '#f0f4ff', borderRadius: 8, padding: 10, marginBottom: 6 },
  gradientBg: { flex: 1 },
}); 