import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, ListRenderItemInfo, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const BROWN = '#6D4C41';
const LIGHT_BROWN = '#A1887F';
const BEIGE = '#EFEBE9';
const GOLD = '#FFD700';
const PATTERN_COLOR = '#f5e9da';

// Define a type for messages
interface ChatMessage {
  id: string;
  from: 'bot' | 'user';
  text: string;
  actions?: string[];
  isShareGraphic?: boolean;
}

// Update initialMessages to use the type
const initialMessages: ChatMessage[] = [
  {
    id: '1',
    from: 'bot',
    text: "👋 Welcome to SolSweep! Ready to find hidden treasure in your Solana wallet?\n\nAdded wallets:\n1. sw7dfe8e3eEXAMPLE1\n2. null\n\nWhat would you like to do?",
    actions: ["Add wallet", "Check wallet", "Farm airdrops"],
  },
];

// Mock airdrop data
const MOCK_AIRDROPS = [
  {
    name: 'Jupiter',
    guide: 'Jupiter Airdrop Guide:\n1. Swap tokens on Jupiter aggregator.\n2. Provide liquidity to eligible pools.\n3. Hold JUP tokens in your wallet.\n4. Follow Jupiter on X for updates.\n5. Check eligibility at jup.ag/airdrop.\n\nTip: The more you swap, the higher your chances!\n\nOfficial site: https://jup.ag\nGuide: https://docs.jup.ag/',
  },
  {
    name: 'Kamino',
    guide: 'Kamino Airdrop Guide:\n1. Deposit assets into Kamino vaults.\n2. Stake KMNO tokens.\n3. Participate in governance.\n4. Use Kamino leverage features.\n5. Stay active in the Kamino Discord.\n\nTip: Early users and stakers are prioritized!\n\nOfficial site: https://kamino.finance\nGuide: https://docs.kamino.finance/',
  },
  {
    name: 'Bonk',
    guide: 'Bonk Airdrop Guide:\n1. Hold BONK tokens in your wallet.\n2. Interact with Bonk dApps.\n3. Join Bonk community events.\n4. Complete Bonk quests.\n5. Follow Bonk on X for airdrop news.\n\nTip: Community engagement increases your chances!\n\nOfficial site: https://bonk.com\nGuide: https://docs.bonk.com/',
  },
  {
    name: 'Sanctum',
    guide: 'Sanctum Airdrop Guide:\n1. Stake SOL with Sanctum.\n2. Use Sanctum liquid staking.\n3. Refer friends to Sanctum.\n4. Hold staked assets for longer periods.\n5. Check eligibility at sanctum.so.\n\nTip: Long-term stakers are rewarded!\n\nOfficial site: https://sanctum.so\nGuide: https://docs.sanctum.so/',
  },
  {
    name: 'Meteora',
    guide: 'Meteora Airdrop Guide:\n1. Provide liquidity on Meteora.\n2. Stake LP tokens.\n3. Use Meteora vaults.\n4. Participate in Meteora governance.\n5. Stay active in the Meteora Telegram.\n\nTip: Active liquidity providers get the most rewards!\n\nOfficial site: https://meteora.ag\nGuide: https://docs.meteora.ag/',
  },
];

const MAX_FREE_CHECKS = 5;
const USDC_PAY_LINK = 'https://solana-pay-link.usdc.mock';
const USDT_PAY_LINK = 'https://solana-pay-link.usdt.mock';
const WALLET_ADDRESS = '7x9abc123EXAMPLEWALLETADDRESSFORDEMO123456789';

// Add this function at the top level, outside HomeScreen
async function sendMessageToBot(userId: string, message: string) {
  const response = await fetch('http://192.168.8.200:3000/api/bot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message }),
  });
  return response.json();
}

export default function HomeScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [freeChecksUsed, setFreeChecksUsed] = useState(4);
  const [premium, setPremium] = useState(false);
  const [awaitingPaymentHash, setAwaitingPaymentHash] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // 1. Add wallet state (must be after premium is defined)
  const maxWallets = premium ? 5 : 2;
  const initialMockWallets = premium
    ? [
        'sw7dfe8e3eEXAMPLE1',
        'dh749dj9rhdEXAMPLE2',
        '8fj3k2j3k2lEXAMPLE3',
        '2k3j4k2j4k2EXAMPLE4',
        '9fj3k2j3k2lEXAMPLE5',
      ]
    : [
        'sw7dfe8e3eEXAMPLE1',
        'dh749dj9rhdEXAMPLE2',
      ];
  const [wallets, setWallets] = useState<(string|null)[]>([...initialMockWallets]);
  const [awaitingWalletToCheck, setAwaitingWalletToCheck] = useState(false);
  const [awaitingAddWallet, setAwaitingAddWallet] = useState(false);

  // 2. Add pending add wallet state
  const [pendingAddWallet, setPendingAddWallet] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to bottom when a new message is added
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Helper to simulate a fun wallet scan result
  const getMockScanResult = () => {
    // Randomize some values for fun
    const airdrops = [
      { name: 'Jupiter', amount: 10 },
      { name: 'Bonk', amount: 5 },
    ];
    const dust = 2;
    const staking = 3;
    const total = airdrops.reduce((sum, a) => sum + a.amount, 0) + dust + staking;
    return {
      airdrops,
      dust,
      staking,
      total,
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Use a static userId for now
    const userId = 'test-user-1';

    // Call backend
    const botResponse = await sendMessageToBot(userId, input);

    setMessages(prev => [
          ...prev,
          {
        id: Date.now().toString(),
              from: 'bot',
        text: botResponse.response,
        actions: botResponse.actions,
      } as ChatMessage,
    ]);
  };

  const renderItem = ({ item }: ListRenderItemInfo<ChatMessage>) => {
    if (item.isShareGraphic) {
      return (
        <View style={styles.shareGraphic}>
          <Image source={require('@/assets/images/icon.png')} style={styles.shareLogo} />
          <Text style={styles.shareText}>{item.text}</Text>
        </View>
      );
    }
    // Special rendering for airdrop guides with mock links
    if (item.from === 'bot' && item.text && (item.text.includes('Official site:') || item.text.includes('Guide:'))) {
      // Split the message into lines
      const lines = item.text.split('\n');
      return (
        <View>
          <View
            style={[
              styles.bubble,
              item.from === 'bot' ? styles.botBubble : styles.userBubble,
              item.from === 'bot' ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' },
            ]}
          >
            {lines.map((line, idx) => {
              if (line.startsWith('Official site:') || line.startsWith('Guide:')) {
                // Extract the label and URL
                const [label, url] = line.split(': ');
                return (
                  <Text key={idx} style={styles.linkText}>
                    {label + ': '}
                    {url}
                  </Text>
                );
              }
              return (
                <Text key={idx} style={item.from === 'bot' ? styles.botText : styles.userText}>{line}</Text>
              );
            })}
          </View>
          {item.from === 'bot' && (item.actions ?? []).length > 0 && (
            <View style={styles.optionsButtonRow}>
              {(item.actions ?? []).map((action, idx) => (
                <View key={action + idx} style={styles.optionButton}>
                  <Text style={styles.optionButtonText}>{action}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }
    return (
      <View>
        <View
          style={[
            styles.bubble,
            item.from === 'bot' ? styles.botBubble : styles.userBubble,
            item.from === 'bot' ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' },
          ]}
        >
          <Text style={item.from === 'bot' ? styles.botText : styles.userText}>{item.text}</Text>
        </View>
        {/* If this is a bot message with actions, show options as styled buttons in a separate row below the bubble */}
        {item.from === 'bot' && (item.actions ?? []).length > 0 && (
          <View style={styles.optionsButtonRow}>
            {(item.actions ?? []).map((action, idx) => (
              <View key={action + idx} style={styles.optionButton}>
                <Text style={styles.optionButtonText}>{action}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Find the latest bot message with actions
  const latestBotWithActions = [...messages].reverse().find(m => m.from === 'bot' && m.actions && m.actions.length > 0);

  // 2. Update welcome message to show added wallets
  function getMainMenuMessage(): ChatMessage {
    return {
      id: Date.now().toString(),
      from: 'bot',
      text:
        "👋 Welcome to SolSweep! Ready to find hidden treasure in your Solana wallet?" +
        "\nAdded wallets:\n" +
        wallets.map((w, i) => `${i + 1}. ${w ? w.slice(0, 12) + '...' : 'null'}`).join('\n'),
      actions: ['Add wallet', 'Check wallet', 'Farm airdrops'],
    };
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Multi-stop diagonal gradient background */}
      <LinearGradient
        colors={["#4E342E", "#6D4C41", "#A1887F", "#FFD700"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[styles.container, { flex: 1 }]}> 
          {/* SVG pattern overlay: waves and dots (as background, never blocking input) */}
          <Svg
            height="100%"
            width="100%"
            viewBox="0 0 400 900"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            pointerEvents="none"
          >
            {/* Wavy lines */}
            <Path d="M0 100 Q100 150 200 100 T400 100" stroke={PATTERN_COLOR} strokeWidth="2" opacity="0.15" fill="none" />
            <Path d="M0 300 Q100 350 200 300 T400 300" stroke={PATTERN_COLOR} strokeWidth="2" opacity="0.15" fill="none" />
            <Path d="M0 500 Q100 550 200 500 T400 500" stroke={PATTERN_COLOR} strokeWidth="2" opacity="0.15" fill="none" />
            {/* Dots pattern */}
            {Array.from({ length: 7 }).map((_, row) => (
              Array.from({ length: 8 }).map((_, col) => (
                <Circle
                  key={`dot-${row}-${col}`}
                  cx={30 + col * 50}
                  cy={60 + row * 120}
                  r="4"
                  fill={PATTERN_COLOR}
                  opacity="0.18"
                />
              ))
            ))}
          </Svg>
          {/* Logo at the top */}
          <View style={styles.logoRow}>
            <Image source={require('@/assets/images/icon.png')} style={styles.headerLogo} />
          </View>
          <View style={[styles.chatArea, { flex: 1 }]}>
            <FlatList
              ref={flatListRef}
              style={{ flex: 1 }}
              data={messages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.chatContainer, { flexGrow: 1, minHeight: '100%' }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={40}
            style={{ flexShrink: 0 }}
          >
            <View style={styles.chatSection}> 
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your response..."
                  placeholderTextColor={LIGHT_BROWN}
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                  <Ionicons name="send" size={24} color={GOLD} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BROWN,
    paddingTop: 40,
  },
  chatArea: {
    flex: 1,
    minHeight: 0,
  },
  chatContainer: {
    padding: 16,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    marginVertical: 6,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: BEIGE,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#A1887F',
  },
  userBubble: {
    backgroundColor: LIGHT_BROWN,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: '#4E342E',
  },
  botText: {
    color: BROWN,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-medium',
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_BROWN,
    padding: 8,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 32,
    marginTop: 8,
    // Add shadow/elevation for visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: BROWN,
    borderRadius: 20,
    padding: 6,
  },
  shareGraphic: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'column',
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  shareLogo: {
    width: 48,
    height: 48,
    marginBottom: 12,
    borderRadius: 12,
  },
  shareText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionsButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
    marginLeft: 8,
    marginTop: 2,
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: '#A1887F',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
  },
  optionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  gradientBg: {
    flex: 1,
  },
  logoRow: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  headerLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    opacity: 0.95,
  },
  chatSection: {
    backgroundColor: '#3E2723',
    borderTopWidth: 2,
    borderTopColor: '#6D4C41',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    marginBottom: 56,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    opacity: 1,
    borderWidth: 1,
    borderColor: '#4E342E',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  linkText: {
    color: '#1976D2',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    marginVertical: 2,
  },
});
