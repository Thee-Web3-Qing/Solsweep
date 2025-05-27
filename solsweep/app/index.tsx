import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { ListRenderItemInfo, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const BROWN = '#6D4C41';
const LIGHT_BROWN = '#A1887F';
const BEIGE = '#EFEBE9';
const GOLD = '#FFD700';
const PATTERN_COLOR = '#f5e9da';

interface ChatMessage {
  id: string;
  from: 'bot' | 'user';
  text: string;
  actions?: string[];
  isShareGraphic?: boolean;
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    from: 'bot',
    text: "👋 Welcome to SolSweep! Ready to find hidden treasure in your Solana wallet?\n\nWhat would you like to do?",
    actions: ["Add wallet", "Check wallet", "Farm airdrops"],
  },
];

async function sendMessageToBot(userId: string, message: string) {
  const response = await fetch('https://solsweep-six.vercel.app/api/bot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message }),
  });
  return response.json();
}

const isWeb = Platform.OS === 'web';

export default function HomeScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const userId = 'test-user-1';
    const botResponse = await sendMessageToBot(userId, input);
    console.log('Bot response (handleSend):', botResponse);
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

  const handleAction = async (action: string) => {
    setInput('');
    const userId = 'test-user-1';
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: action,
    };
    setMessages((prev) => [...prev, userMsg]);
    const botResponse = await sendMessageToBot(userId, action);
    console.log('Bot response (handleAction):', botResponse);
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

  const handleReset = () => {
    setMessages(initialMessages);
    setInput('');
  };

  const renderItem = ({ item }: ListRenderItemInfo<ChatMessage>) => {
    if (item.isShareGraphic) {
      return (
        <View style={styles.shareGraphic}>
          <Text style={styles.shareText}>{item.text}</Text>
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
        {item.from === 'bot' && (item.actions ?? []).length > 0 && (
          <View style={styles.optionsButtonRow}>
            {(item.actions ?? []).map((action, idx) => (
              <TouchableOpacity key={action + idx} style={styles.optionButton} onPress={() => handleAction(action)}>
                <Text style={styles.optionButtonText}>{action}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'blue' }}>
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={["#4E342E", "#6D4C41", "#A1887F", "#FFD700"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Svg
          height="100%"
          width="100%"
          viewBox="0 0 400 900"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        >
          <Path d="M0 100 Q100 150 200 100 T400 100" stroke={PATTERN_COLOR} strokeWidth="2" opacity="0.15" fill="none" />
          <Path d="M0 300 Q100 350 200 300 T400 300" stroke={PATTERN_COLOR} strokeWidth="2" opacity="0.15" fill="none" />
          <Path d="M0 500 Q100 550 200 500 T400 500" stroke={PATTERN_COLOR} strokeWidth="2" opacity="0.15" fill="none" />
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
        <View style={[styles.chatArea, { flex: 1 }]}> 
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={[styles.chatContainer, { flexGrow: 1, justifyContent: 'flex-end' }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((item, idx) => (
              <React.Fragment key={item.id}>
                {renderItem({
                  item,
                  index: idx,
                  separators: {
                    highlight: () => {},
                    unhighlight: () => {},
                    updateProps: () => {},
                  },
                })}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      </View>
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#3E2723' }}>
        <View style={styles.chatSection}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type your response..."
              placeholderTextColor={LIGHT_BROWN}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
              <Ionicons name="send" size={24} color={GOLD} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
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
    backgroundColor: '#3E2723',
    padding: 0,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    marginTop: 0,
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
  chatSection: {
    backgroundColor: '#3E2723',
    borderTopWidth: 2,
    borderTopColor: '#6D4C41',
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    marginBottom: 0,
    opacity: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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