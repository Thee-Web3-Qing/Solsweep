import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

// Demo goals
const goals = [
  { description: 'Car', targetMetric: '$50,000', deadline: 'May 31' },
  { description: 'Laptop', targetMetric: '$2,000', deadline: 'July 15' },
  { description: 'Vacation', targetMetric: '$5,000', deadline: 'December 1' },
  { description: 'Health Insurance', targetMetric: '$1,200', deadline: 'January 1' },
  { description: 'Private Jet', targetMetric: '$5,000,000', deadline: 'December 31, 2030' },
];

// Flower SVG/PNG placeholder (half-dead flower)
const flowerSvg = 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/black/svg/leaf-half-o.svg'; // Use a leaf/flower SVG for demo

// Demo data for portfolio
const portfolioBalance = '$3,080.00';
const percentChange = '+3.2%';
const percentColor = '#2ecc71';
const assetDistribution = [
  { name: 'SOL', value: 450, color: '#007AFF' },
  { name: 'USDC', value: 1200, color: '#2ecc71' },
  { name: 'ETH', value: 480, color: '#ff9800' },
  { name: 'BTC', value: 650, color: '#f44336' },
  { name: 'NFT', value: 300, color: '#9c27b0' },
];

export default function DashboardScreen() {
  const router = useRouter();

  // Use the first goal as the prioritized goal (sync with Home page logic)
  const prioritizedGoal = goals[0];

  return (
    <LinearGradient colors={['#e0f2ff', '#fff']} style={styles.gradientBg}>
      <View style={styles.container}>
        {/* Add extra margin above the title to move everything lower */}
        <View style={{ height: 32 }} />
        <Text style={styles.title}>Dashboard</Text>
        <LinearGradient colors={['#007AFF', '#6EC6FF']} style={styles.scoreBar} start={{x:0, y:0}} end={{x:1, y:0}}>
          <View style={styles.scoreBarContent}>
            <View style={styles.scoreBarLeft}>
              <Text style={styles.scoreBarLabel}>Web3 Score</Text>
              <Text style={styles.scoreBarValue}>500</Text>
            </View>
            <View style={styles.profileBarContainer}>
              <View style={styles.profileTextCol}>
                <Text style={styles.accountNameSmall}>John Doe</Text>
                <Text style={styles.accountEmailSmall}>john.doe@email.com</Text>
                <Text style={styles.accountWalletSmall}>Wallet: 7gk...9X2</Text>
              </View>
              <View style={styles.avatarCircleSmall}>
                <Text style={styles.avatarTextSmall}>JD</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        {/* Portfolio Section */}
        <View style={styles.portfolioCard}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <View style={styles.portfolioBalanceRow}>
            <View>
              <Text style={styles.portfolioBalanceLabel}>Total Balance</Text>
              <Text style={styles.portfolioBalanceValue}>{portfolioBalance}</Text>
            </View>
            <View style={styles.portfolioPercentChangeBox}>
              <Text style={[styles.portfolioPercentChange, { color: percentColor }]}>{percentChange} (24h)</Text>
            </View>
          </View>
          <View style={styles.pieChartContainer}>
            {/* Pie Chart Placeholder (revert to before asset sync) */}
            <View style={styles.pieChartPlaceholder}>
              <Text style={styles.pieChartText}>[Pie Chart]</Text>
            </View>
            {/* Static legend for visual reference */}
            <View style={styles.pieLegendContainer}>
              <View style={styles.pieLegendRow}>
                <View style={[styles.pieLegendDot, { backgroundColor: '#007AFF' }]} />
                <Text style={styles.pieLegendLabel}>SOL</Text>
                <Text style={styles.pieLegendValue}>$450</Text>
              </View>
              <View style={styles.pieLegendRow}>
                <View style={[styles.pieLegendDot, { backgroundColor: '#2ecc71' }]} />
                <Text style={styles.pieLegendLabel}>USDC</Text>
                <Text style={styles.pieLegendValue}>$1,200</Text>
              </View>
              <View style={styles.pieLegendRow}>
                <View style={[styles.pieLegendDot, { backgroundColor: '#ff9800' }]} />
                <Text style={styles.pieLegendLabel}>ETH</Text>
                <Text style={styles.pieLegendValue}>$480</Text>
              </View>
              <View style={styles.pieLegendRow}>
                <View style={[styles.pieLegendDot, { backgroundColor: '#f44336' }]} />
                <Text style={styles.pieLegendLabel}>BTC</Text>
                <Text style={styles.pieLegendValue}>$650</Text>
              </View>
              <View style={styles.pieLegendRow}>
                <View style={[styles.pieLegendDot, { backgroundColor: '#9c27b0' }]} />
                <Text style={styles.pieLegendLabel}>NFT</Text>
                <Text style={styles.pieLegendValue}>$300</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Connect Socials Section */}
        <View style={styles.socialsCard}>
          <Text style={styles.sectionTitle}>Connect Socials</Text>
          <View style={styles.socialsRow}>
            <View style={styles.socialItem}>
              <Text style={styles.socialIcon}>𝕏</Text>
              <Text style={styles.socialLabel}>X</Text>
              <View style={styles.socialButton}><Text style={styles.socialButtonText}>Connect</Text></View>
            </View>
            <View style={styles.socialItem}>
              <Text style={styles.socialIcon}>📸</Text>
              <Text style={styles.socialLabel}>Instagram</Text>
              <View style={styles.socialButton}><Text style={styles.socialButtonText}>Connect</Text></View>
            </View>
            <View style={styles.socialItem}>
              <Text style={styles.socialIcon}>🎵</Text>
              <Text style={styles.socialLabel}>TikTok</Text>
              <View style={styles.socialButton}><Text style={styles.socialButtonText}>Connect</Text></View>
            </View>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Your Goals</Text>
        <FlatList
          data={goals}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <LinearGradient colors={['#e0f2ff', '#b3e5fc']} style={styles.goalBar} start={{x:0, y:0}} end={{x:1, y:0}}>
              <Text style={styles.goalBarHeading}>{item.description}: {item.targetMetric}</Text>
              <Text style={styles.goalBarBody}>{item.deadline}</Text>
            </LinearGradient>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No goals yet.</Text>}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  flowerContainer: { alignItems: 'center', marginBottom: 16, marginTop: 8 },
  flowerEmoji: { fontSize: 72, textAlign: 'center', height: 90 }, // ~3cm tall
  flowerCaption: { color: '#007AFF', fontWeight: 'bold', fontSize: 16, marginTop: 4 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  scoreContainer: { alignItems: 'center', marginBottom: 24 },
  scoreText: { fontSize: 18 },
  prioritizedGoal: { marginBottom: 24, padding: 16, backgroundColor: '#f7f7f7', borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  goalCard: { backgroundColor: '#e0f7fa', borderRadius: 8, padding: 16, marginBottom: 12 },
  emptyText: { color: '#888', textAlign: 'center', marginBottom: 12 },
  linkButton: { backgroundColor: '#007AFF', borderRadius: 8, padding: 12, marginTop: 12, marginBottom: 12 },
  linkButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  gradientBg: { flex: 1 },
  scoreBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 18, marginBottom: 24, marginTop: 8 },
  scoreBarContent: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' },
  scoreBarLeft: { flexDirection: 'column', justifyContent: 'center' },
  scoreBarLabel: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  scoreBarValue: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  profileBarContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 16 },
  profileTextCol: { alignItems: 'flex-end', marginRight: 10 },
  avatarCircleSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0f2ff', justifyContent: 'center', alignItems: 'center' },
  avatarTextSmall: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  accountNameSmall: { fontSize: 14, fontWeight: 'bold', color: '#fff', textAlign: 'right' },
  accountEmailSmall: { fontSize: 12, color: '#e0f2ff', marginTop: 1, textAlign: 'right' },
  accountWalletSmall: { fontSize: 11, color: '#b3e5fc', marginTop: 1, textAlign: 'right' },
  goalBar: { borderRadius: 14, padding: 16, marginBottom: 14, marginHorizontal: 2 },
  goalBarHeading: { fontWeight: 'bold', fontSize: 18, color: '#007AFF', marginBottom: 4 },
  goalBarBody: { fontSize: 15, color: '#333' },
  portfolioCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 32, shadowColor: '#007AFF', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginTop: 8 },
  portfolioBalanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  portfolioBalanceLabel: { fontSize: 15, color: '#007AFF', marginBottom: 2 },
  portfolioBalanceValue: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  portfolioPercentChangeBox: { justifyContent: 'center', alignItems: 'flex-end' },
  portfolioPercentChange: { fontSize: 16, fontWeight: 'bold' },
  pieChartContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  pieChartPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e0f2ff', justifyContent: 'center', alignItems: 'center', marginRight: 18, borderWidth: 2, borderColor: '#b3e5fc' },
  pieChartText: { color: '#007AFF', fontWeight: 'bold', fontSize: 13 },
  pieLegendContainer: { flex: 1 },
  pieLegendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  pieLegendDot: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
  pieLegendLabel: { fontSize: 14, color: '#333', flex: 1 },
  pieLegendValue: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  socialsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 32, shadowColor: '#007AFF', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginTop: 8 },
  socialsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 8 },
  socialItem: { alignItems: 'center', flex: 1 },
  socialIcon: { fontSize: 32, marginBottom: 4 },
  socialLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 6, color: '#333' },
  socialButton: { backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 18, marginBottom: 4 },
  socialButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
}); 