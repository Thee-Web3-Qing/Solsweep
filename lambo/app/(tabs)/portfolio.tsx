import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const demoAssets = [
  { name: 'SOL', amount: 2.5, value: '$450.00' },
  { name: 'USDC', amount: 1200, value: '$1,200.00' },
  { name: 'ETH', amount: 0.15, value: '$480.00' },
  { name: 'BTC', amount: 0.01, value: '$650.00' },
  { name: 'NFT', amount: 3, value: '$300.00' },
];

const demoActivities = [
  { type: 'Swap', desc: 'Swapped 1.0 SOL for 20 USDC', time: '2h ago' },
  { type: 'Buy', desc: 'Bought 0.01 BTC', time: '5h ago' },
  { type: 'Sell', desc: 'Sold 0.05 ETH', time: '1d ago' },
  { type: 'Airdrop', desc: 'Claimed NFT Airdrop', time: '2d ago' },
  { type: 'Buy', desc: 'Bought 1.5 SOL', time: '3d ago' },
];

const timeFrames = ['5m', '1h', '24h', '1w', '1m'];

export default function PortfolioScreen() {
  const [selectedTime, setSelectedTime] = useState('24h');
  const percentChange = '+3.2%';
  const percentColor = '#2ecc71'; // green for positive, red for negative

  return (
    <LinearGradient colors={['#e0f2ff', '#fff']} style={styles.gradientBg}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={{ height: 32 }} />
        {/* Header */}
        <Text style={styles.title}>Portfolio</Text>

        {/* Portfolio Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Balance</Text>
          <Text style={styles.balanceValue}>$3,080.00</Text>
          <View style={styles.balanceRow}>
            <Text style={[styles.percentChange, { color: percentColor }]}>{percentChange}</Text>
            <View style={styles.timeFrameRow}>
              {timeFrames.map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[styles.timeFrameBtn, selectedTime === tf && styles.timeFrameBtnActive]}
                  onPress={() => setSelectedTime(tf)}
                >
                  <Text style={[styles.timeFrameText, selectedTime === tf && styles.timeFrameTextActive]}>{tf}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Wallets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallets</Text>
          {/* Example wallet item */}
          <View style={styles.walletItem}>
            <Text style={styles.walletName}>Main Wallet</Text>
            <Text style={styles.walletBalance}>$3,080.00</Text>
          </View>
          {/* Add more wallets as needed */}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Assets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assets</Text>
          {demoAssets.map((asset) => (
            <View style={styles.assetItem} key={asset.name}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.assetAmount}>{asset.amount}</Text>
                <Text style={styles.assetValue}>{asset.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {demoActivities.map((act, idx) => (
            <View style={styles.activityItem} key={idx}>
              <Text style={styles.activityType}>{act.type}</Text>
              <Text style={styles.activityDesc}>{act.desc}</Text>
              <Text style={styles.activityTime}>{act.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 18, textAlign: 'center' },

  summaryCard: {
    backgroundColor: '#e0f2ff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryTitle: { fontSize: 16, color: '#007AFF', marginBottom: 6 },
  balanceValue: { fontSize: 32, fontWeight: 'bold', color: '#222' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, width: '100%', justifyContent: 'space-between' },
  percentChange: { fontSize: 16, fontWeight: 'bold', marginRight: 12 },
  timeFrameRow: { flexDirection: 'row', alignItems: 'center' },
  timeFrameBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#e0f2ff', marginLeft: 4 },
  timeFrameBtnActive: { backgroundColor: '#007AFF' },
  timeFrameText: { color: '#007AFF', fontWeight: 'bold', fontSize: 13 },
  timeFrameTextActive: { color: '#fff' },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#007AFF' },

  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  walletName: { fontSize: 16, color: '#333' },
  walletBalance: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },

  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },

  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  assetName: { fontSize: 16, color: '#333' },
  assetAmount: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  assetValue: { fontSize: 13, color: '#888' },

  activityItem: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  activityType: { fontWeight: 'bold', color: '#007AFF', fontSize: 15 },
  activityDesc: { color: '#333', fontSize: 14, marginTop: 2 },
  activityTime: { color: '#888', fontSize: 12, marginTop: 2 },
}); 