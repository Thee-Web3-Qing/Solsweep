import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Easing, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddGoalScreen() {
  const [description, setDescription] = useState('');
  const [targetMetric, setTargetMetric] = useState('');
  const [deadline, setDeadline] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const plusAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();

  const handleSave = () => {
    // TODO: Save goal to storage or context, including imageUrl
    router.replace('/dashboard');
  };

  const handleCategoryPress = (cat: string) => {
    setSelectedCategory(cat);
    setDescription(cat);
    setDropdownOpen(false);
  };

  const bouncePlus = () => {
    Animated.sequence([
      Animated.timing(plusAnim, { toValue: -15, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(plusAnim, { toValue: 0, duration: 180, useNativeDriver: true, easing: Easing.in(Easing.quad) })
    ]).start();
  };

  const handleSaveWithBounce = () => {
    bouncePlus();
    handleSave();
  };

  // Demo goals for this screen
  const demoGoals = [
    { description: 'Camera', targetMetric: '$1,500', deadline: 'August 10' },
    { description: 'Bike', targetMetric: '$800', deadline: 'September 5' },
    { description: 'Conference Ticket', targetMetric: '$300', deadline: 'October 20' },
  ];

  const goalCategories = [
    'Travel', 'Tech', 'Health', 'Investment', 'Fun', 'Education', 'Fitness', 'Family', 'Business'
  ];

  return (
    <LinearGradient colors={['#e0f2ff', '#fff']} style={styles.gradientBg}>
      <View style={styles.container}>
        {/* Top heading and subtext */}
        <Text style={styles.pageHeading}>New target already?</Text>
        <Text style={styles.pageSubtext}>Na you dey hot</Text>
        {/* Goal Categories Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.categoryDropdownChip}
            onPress={() => setDropdownOpen((open) => !open)}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryDropdownText}>{selectedCategory || 'Categories'}</Text>
            <Ionicons
              name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {goalCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.dropdownItem}
                  onPress={() => handleCategoryPress(cat)}
                >
                  <Text style={styles.dropdownItemText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {/* Demo goals in a horizontal scrollable bar */}
        <Text style={styles.demoTitle}>Need help?</Text>
        <View style={styles.demoScrollRow}>
          <FlatList
            data={demoGoals}
            horizontal
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <LinearGradient colors={['#b3e5fc', '#e0f2ff']} style={styles.demoGoalBar} start={{x:0, y:0}} end={{x:1, y:0}}>
                <Text style={styles.demoGoalHeading}>{item.description}</Text>
                <Text style={styles.demoGoalMetric}>{item.targetMetric}</Text>
                <Text style={styles.demoGoalDeadline}>{item.deadline}</Text>
              </LinearGradient>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <Text style={styles.title}>Add New Goal</Text>
        <TextInput
          style={styles.input}
          placeholder="Goal Description"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Target Metric (e.g., SOL, NFT name)"
          value={targetMetric}
          onChangeText={setTargetMetric}
        />
        <TextInput
          style={styles.input}
          placeholder="Deadline (optional)"
          value={deadline}
          onChangeText={setDeadline}
        />
        <View style={styles.imageInputRow}>
          <Ionicons name="image-outline" size={24} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChangeText={setImageUrl}
          />
        </View>
        <TouchableOpacity style={styles.blueButton} onPress={handleSaveWithBounce}>
          <Animated.Text style={styles.blueButtonText}>Save Goal</Animated.Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  imageInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  blueButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, marginTop: 8 },
  blueButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  gradientBg: { flex: 1 },
  demoTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 8, marginTop: 8 },
  demoScrollRow: { marginBottom: 18 },
  demoGoalBar: { borderRadius: 14, padding: 16, marginRight: 14, minWidth: 140, alignItems: 'center' },
  demoGoalHeading: { fontWeight: 'bold', fontSize: 16, color: '#007AFF', marginBottom: 2 },
  demoGoalMetric: { fontSize: 15, color: '#333', marginBottom: 2 },
  demoGoalDeadline: { fontSize: 13, color: '#666' },
  motivationBanner: { borderRadius: 16, padding: 18, marginBottom: 18, alignItems: 'center' },
  motivationText: { color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center' },
  dropdownContainer: { marginBottom: 18, alignItems: 'flex-start', position: 'relative' },
  categoryDropdownChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1565c0', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 18 },
  categoryDropdownText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dropdownList: { backgroundColor: '#fff', borderRadius: 12, marginTop: 6, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, width: 180, position: 'absolute', zIndex: 10, top: 48, left: 0 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 16 },
  dropdownItemText: { color: '#1565c0', fontWeight: 'bold', fontSize: 15 },
  categoryChipSelected: { backgroundColor: '#007AFF' },
  categoryChipTextSelected: { color: '#fff', textDecorationLine: 'underline' },
  pageHeading: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', marginBottom: 2, marginTop: 8, textAlign: 'left' },
  pageSubtext: { fontSize: 15, color: '#333', marginBottom: 12, textAlign: 'left', fontStyle: 'italic' },
}); 