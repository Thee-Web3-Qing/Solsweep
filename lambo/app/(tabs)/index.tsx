import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { FlatList, Image, ImageBackground, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const profile = {
  username: 'DreamChaser',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg', // Placeholder avatar
};

// Placeholder goals with image URLs
const goals = [
  {
    description: 'Buy a Solana NFT',
    targetMetric: '1 SOL',
    deadline: '2024-12-31',
    progress: 0.4,
    imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', // clothes
  },
  {
    description: 'Get a new car',
    targetMetric: '100 SOL',
    deadline: '2025-06-01',
    progress: 0.1,
    imageUrl: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80', // car
  },
  {
    description: 'Own a house',
    targetMetric: '1000 SOL',
    deadline: '2026-01-01',
    progress: 0.05,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80', // house
  },
];

// Fallback images for demo
const fallbackImages = [
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80', // car
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80', // house
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', // clothes
];

const dotPattern = { uri: 'https://www.toptal.com/designers/subtlepatterns/patterns/dots.png' };

export default function HomeScreen() {
  const [reflection, setReflection] = useState('');
  const [message, setMessage] = useState('');
  const [reflectionPast, setReflectionPast] = useState('');
  const [reflectionCurrent, setReflectionCurrent] = useState('');
  const [reflectionFuture, setReflectionFuture] = useState('');
  const [wallet, setWallet] = useState('');
  // Pick a random goal for demo
  const goal = goals[Math.floor(Math.random() * goals.length)];

  // Collect all user goal images, fallback to demo images if none
  const userImages = goals.map(g => g.imageUrl).filter(Boolean);
  const imagesToShow = userImages.length > 0 ? userImages : fallbackImages;

  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleRecord = () => {
    setMessage('Progress recorded!');
    setReflection('');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleReflectionSave = () => {
    // Implementation of handleReflectionSave
  };

  const handleWalletSave = () => {
    // Implementation of handleWalletSave
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#e0f2ff', '#fff']}
        style={styles.gradientBg}
      >
        <ImageBackground
          source={dotPattern}
          style={styles.patternBg}
          imageStyle={{ opacity: 0.38 }}
          resizeMode="repeat"
        >
          <HomeContent />
        </ImageBackground>
      </LinearGradient>
    </SafeAreaView>
  );
}

function HomeContent() {
  const { width } = useWindowDimensions();
  const cardGap = 16;
  const horizontalPadding = 24;
  const cardSize = ((width - horizontalPadding * 2 - cardGap) / 2) * 0.7;
  const imageSize = Math.min(140, (width - horizontalPadding * 2 - 32) / 3);
  const [reflection, setReflection] = useState('');
  const [message, setMessage] = useState('');
  const [reflectionPast, setReflectionPast] = useState('');
  const [reflectionCurrent, setReflectionCurrent] = useState('');
  const [reflectionFuture, setReflectionFuture] = useState('');
  const [wallet, setWallet] = useState('');
  // Pick a random goal for demo ONLY ONCE per mount
  const goalRef = React.useRef(goals[Math.floor(Math.random() * goals.length)]);
  const goal = goalRef.current;

  // Collect all user goal images, fallback to demo images if none
  const userImages = goals.map(g => g.imageUrl).filter(Boolean);
  const imagesToShow = userImages.length > 0 ? userImages : fallbackImages;

  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleRecord = () => {
    setMessage('Progress recorded!');
    setReflection('');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleReflectionSave = () => {
    // Implementation of handleReflectionSave
  };

  const handleWalletSave = () => {
    // Implementation of handleWalletSave
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {/* Profile at top right */}
      <View style={styles.profileRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.profileContainer}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <Text style={styles.username}>{profile.username}</Text>
        </TouchableOpacity>
      </View>

      {/* Most important goal */}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>Your Most Important Goal</Text>
        <Text style={styles.goalDesc}>{goal.description}</Text>
        <Text style={styles.goalTarget}>Target: {goal.targetMetric}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: `${goal.progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(goal.progress * 100)}% complete</Text>
      </View>

      {/* Motivational images */}
      <Text style={styles.motivationalCaption}>E dey enter your eye bah?</Text>
      <FlatList
        data={imagesToShow}
        horizontal
        keyExtractor={(item, idx) => item + idx}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={[styles.motivationalImageLarge, { width: imageSize, height: imageSize }]} />
        )}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 24, marginTop: 8 }}
      />

      {/* Daily reflection */}
      <Text style={styles.reflectionPrompt}>How has your day been?</Text>
      <TextInput
        style={styles.reflectionInput}
        placeholder="What have you achieved so far?"
        value={reflection}
        onChangeText={setReflection}
        multiline
      />
      <TouchableOpacity style={styles.blueButton} onPress={handleRecord}>
        <Text style={styles.blueButtonText}>Record Progress</Text>
      </TouchableOpacity>
      {!!message && <Text style={styles.successMsg}>{message}</Text>}

      {/* Add extra margin above the cards to bring them lower */}
      <View style={{ height: 32 }} />
      <View style={[styles.cardRow, { gap: cardGap }]}>
        <TouchableOpacity onPress={() => setShowReflectionModal(true)}>
          <LinearGradient colors={['#1565c0', '#007AFF']} style={[styles.squareCard, { width: cardSize, height: cardSize }]}>
            <View style={styles.cardCircle1} />
            <View style={styles.cardCircle2} />
            <Text style={[styles.cardText, { fontSize: Math.max(16, cardSize * 0.11) }]}>Web3 Reflection</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowWalletModal(true)}>
          <LinearGradient colors={['#1565c0', '#007AFF']} style={[styles.squareCard, { width: cardSize, height: cardSize }]}>
            <View style={styles.cardCircle1} />
            <View style={styles.cardCircle2} />
            <Text style={[styles.cardText, { fontSize: Math.max(16, cardSize * 0.11) }]}>Add Watch Wallet</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Reflection Modal */}
      <Modal visible={showReflectionModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Web3 Reflection</Text>
            <TextInput
              style={styles.input}
              placeholder="Past Web3 actions"
              value={reflectionPast}
              onChangeText={setReflectionPast}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Current efforts"
              value={reflectionCurrent}
              onChangeText={setReflectionCurrent}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Future (uncertain) aspirations"
              value={reflectionFuture}
              onChangeText={setReflectionFuture}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity style={styles.blueButtonSmall} onPress={() => { setShowReflectionModal(false); }}>
                <Text style={styles.blueButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.blueButtonSmall} onPress={handleReflectionSave}>
                <Text style={styles.blueButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Watch Wallet Modal */}
      <Modal visible={showWalletModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Add Watch Wallet</Text>
            <TextInput
              style={styles.input}
              placeholder="Solana Public Key (optional)"
              value={wallet}
              onChangeText={setWallet}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity style={styles.blueButtonSmall} onPress={() => { setShowWalletModal(false); }}>
                <Text style={styles.blueButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.blueButtonSmall} onPress={handleWalletSave}>
                <Text style={styles.blueButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 48 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  username: { fontWeight: 'bold', fontSize: 16 },
  goalCard: { backgroundColor: '#e0f7fa', borderRadius: 12, padding: 20, marginBottom: 20 },
  goalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  goalDesc: { fontSize: 16, marginBottom: 4 },
  goalTarget: { fontSize: 14, color: '#555', marginBottom: 8 },
  progressBarBg: { height: 10, backgroundColor: '#b2ebf2', borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  progressBar: { height: 10, backgroundColor: '#007AFF', borderRadius: 5 },
  progressText: { fontSize: 12, color: '#007AFF', marginBottom: 4 },
  motivationalCaption: { fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'left', marginTop: 16 },
  motivationalImageLarge: { width: 140, height: 140, borderRadius: 18, marginRight: 18 },
  reflectionPrompt: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  reflectionInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, minHeight: 60, marginBottom: 12 },
  successMsg: { color: 'green', textAlign: 'center', marginTop: 8 },
  blueButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, marginTop: 8 },
  blueButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  sectionCard: { backgroundColor: '#f7f7f7', borderRadius: 12, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, minHeight: 60, marginBottom: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  squareCard: { flex: 1, aspectRatio: 1, borderRadius: 20, marginHorizontal: 8, overflow: 'hidden', backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cardCircle1: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.18)', top: 18, left: 18, zIndex: 1 },
  cardCircle2: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.12)', bottom: 18, right: 18, zIndex: 1 },
  cardText: { color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center', zIndex: 2, fontFamily: 'Avenir-Heavy' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 },
  blueButtonSmall: { backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, marginRight: 8 },
  gradientBg: { flex: 1 },
  patternBg: { flex: 1 },
});
