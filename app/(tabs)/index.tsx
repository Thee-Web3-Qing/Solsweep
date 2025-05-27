import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, ListRenderItemInfo, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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
    text: "👋 Welcome to SolSweep!\nLet's help you discover hidden value in your Solana wallet.\nYou've added these wallets so far:\n1. sw7dfe8e3eEXAMPLE1\n2. (empty slot)\nWhat would you like to do next?",
    actions: ["Add Wallet", "Check My Wallets", "Farm Airdrops", "On Chain Streak"],
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

export default function HomeScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [freeChecksUsed, setFreeChecksUsed] = useState(4);
  const [premium, setPremium] = useState(false);
  const [awaitingPaymentHash, setAwaitingPaymentHash] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [currentAirdrop, setCurrentAirdrop] = useState<string | null>(null);

  // 1. Add wallet state (must be after premium is defined)
  const maxWallets = premium ? 5 : 2;
  const initialMockWallets = premium
    ? [
        'sw7dfe8e3eEXAMPLE1',
        null,
        '8fj3k2j3k2lEXAMPLE3',
        '2k3j4k2j4k2EXAMPLE4',
        '9fj3k2j3k2lEXAMPLE5',
      ]
    : [
        'sw7dfe8e3eEXAMPLE1',
        null,
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

  // Helper to handle bot responses with typing indicator
  function botRespond(callback: () => void, delay = 1000) {
    setBotTyping(true);
    setTimeout(() => {
      setBotTyping(false);
      callback();
    }, delay);
  }

  const handleSend = (overrideInput?: string) => {
    const textToSend = (overrideInput !== undefined ? overrideInput : input).trim();
    if (!textToSend) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      from: 'user' as const,
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // If awaiting payment hash, handle hash or menu
    if (awaitingPaymentHash) {
      if (["main menu", "back"].includes(textToSend.toLowerCase())) {
        setAwaitingPaymentHash(false);
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            getMainMenuMessage(),
          ]);
        }, 600);
        return;
      }
      // For testing: treat any non-empty input as a valid hash
      const txHash = textToSend;
      const isValidHash = txHash.length > 0; // Accept any non-empty string
      if (isValidHash) {
        botRespond(() => {
          setPremium(true);
          setAwaitingPaymentHash(false);
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 200).toString(),
              from: 'bot' as const,
              text:
                `✅ Payment received and verified! You are now a SolSweep Premium member.\n\nEnjoy unlimited wallet checks, auto-claiming, and dust swapping!\n\nType 'Check [your wallet address]' to continue sweeping. 🧹✨`,
              actions: ['Check [your wallet address]'],
            },
          ]);
        }, 1200);
        return;
      } else {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 201).toString(),
              from: 'bot' as const,
              text: `❌ Please enter a transaction hash to continue.`,
              actions: ['Send transaction hash', 'Main menu'],
            },
          ]);
        }, 800);
        return;
      }
    }

    // 'pay' command: show payment instructions if not premium and 5 checks used
    if (textToSend.toLowerCase() === 'pay' && !premium && freeChecksUsed >= MAX_FREE_CHECKS) {
      setAwaitingPaymentHash(true);
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 203).toString(),
            from: 'bot' as const,
            text:
              `You have used all 5 free checks!\n\n` +
              `Unlock unlimited wallet checks, auto-claiming, and dust swapping for just $5/month!\n\n` +
              `To upgrade, please send $5 (in USDC or USDT) to the following wallet address on Solana Mainnet:\n` +
              `Wallet: ${WALLET_ADDRESS}\nNetwork: Solana Mainnet\nAmount: $5 USDC or USDT\n\n` +
              `After sending, reply with your transaction hash for verification. 🏆`,
            actions: ['Send transaction hash', 'Main menu'],
          },
        ]);
      }, 800);
      return;
    }

    // Main menu/back command
    if (["main menu", "back"].includes(textToSend.toLowerCase())) {
      setCurrentAirdrop(null);
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          getMainMenuMessage(),
        ]);
      }, 600);
      return;
    }

    // Farm airdrops flow
    if (textToSend.toLowerCase() === 'farm airdrops') {
      setCurrentAirdrop(null);
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 100).toString(),
            from: 'bot' as const,
            text:
              'Here are 5 airdrops you can farm right now based on on-chain analysis:\n' +
              MOCK_AIRDROPS.map((a, i) => `${i + 1}. ${a.name}`).join('\n') +
              '\n\nType the name of the airdrop you want to farm for a comprehensive guide.',
            actions: MOCK_AIRDROPS.map(a => a.name),
          },
        ]);
      }, 1000);
      return;
    }

    // If user selects an airdrop, set currentAirdrop
    const airdrop = MOCK_AIRDROPS.find(a => a.name.toLowerCase() === textToSend.toLowerCase());
    if (airdrop) {
      setCurrentAirdrop(airdrop.name);
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 101).toString(),
            from: 'bot' as const,
            text: airdrop.guide + '\n\nYou can now try commands like:\n- how much have I deposited?\n- how much have I deposited in ' + airdrop.name + '\n- deposit $50 into ' + airdrop.name + ' vault\n- stake $200 ' + (airdrop.name === 'Kamino' ? 'KMNO' : 'tokens') + '\n- provide liquidity to ' + airdrop.name,
            actions: [],
          },
        ]);
      }, 1000);
      return;
    }

    // If user types 'claim'
    if (textToSend.toLowerCase() === 'claim') {
      setAwaitingAddWallet(false);
      setAwaitingWalletToCheck(false);
      if (premium) {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 6).toString(),
              from: 'bot' as const,
              text: `🎁 To claim your airdrop, you'll need to sign a claim transaction in your wallet.\n\n1. Click the button below to open your wallet and review the claim transaction.\n2. Approve the transaction to receive your tokens.\n\n[Claim Airdrop]\n\n*Note: Claiming airdrops is only possible if SolSweep is integrated with the actual airdrop program. Never share your private key. SolSweep will never ask for it!*`,
              actions: ['Claim Airdrop'],
            },
          ]);
        }, 1000);
      } else {
        setAwaitingPaymentHash(true);
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 203).toString(),
              from: 'bot' as const,
              text:
                `🚫 Claiming is a premium feature!\n\n` +
                `Unlock unlimited wallet checks, auto-claiming, and dust swapping for just $5/month!\n\n` +
                `To upgrade, please send $5 (in USDC or USDT) to the following wallet address on Solana Mainnet:\n` +
                `Wallet: ${WALLET_ADDRESS}\nNetwork: Solana Mainnet\nAmount: $5 USDC or USDT\n\n` +
                `After sending, reply with your transaction hash for verification. 🏆`,
              actions: ['Send transaction hash', 'Main menu'],
            },
          ]);
        }, 800);
      }
      return;
    }

    // If user is not premium and has used all free checks, only allow claim or pay to trigger payment flow
    if (!premium && freeChecksUsed >= MAX_FREE_CHECKS) {
      if (textToSend.toLowerCase() === 'claim') {
        setAwaitingPaymentHash(true);
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 203).toString(),
              from: 'bot' as const,
              text:
                `🚫 Claiming is a premium feature!\n\n` +
                `Unlock unlimited wallet checks, auto-claiming, and dust swapping for just $5/month!\n\n` +
                `To upgrade, please send $5 (in USDC or USDT) to the following wallet address on Solana Mainnet:\n` +
                `Wallet: ${WALLET_ADDRESS}\nNetwork: Solana Mainnet\nAmount: $5 USDC or USDT\n\n` +
                `After sending, reply with your transaction hash for verification. 🏆`,
              actions: ['Send transaction hash', 'Main menu'],
            },
          ]);
        }, 800);
        return;
      } else {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              from: 'bot' as const,
              text:
                `🚫 You have used all 5 free checks!\n\n` +
                `Type 'claim' to upgrade and unlock premium features.`,
              actions: ['Claim', 'Main menu'],
            },
          ]);
        }, 1000);
        return;
      }
    }

    // Handle 'Check My Wallets' as an alias for 'check wallet' but with 'Check All Wallets' option
    if (textToSend.toLowerCase() === 'check my wallets') {
      setAwaitingWalletToCheck(true);
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 23).toString(),
            from: 'bot',
            text:
              'Would you like to check a specific wallet or all wallets?\n' +
              'Here are your added wallets:\n' +
              wallets.map((w, i) => `${i + 1}. ${w ? w.slice(0, 12) + '...' : 'null'}`).join('\n') +
              '\n\nReply with the wallet number, paste the address, or select "Check All Wallets".',
            actions: ['Check All Wallets', ...wallets.filter(Boolean).map((w, i) => `${i + 1}`)],
          },
        ]);
      }, 600);
      return;
    }

    // If user is not premium and has free checks left, allow check
    if (!premium && textToSend.toLowerCase().startsWith('check ')) {
      if (freeChecksUsed < MAX_FREE_CHECKS) {
        botRespond(() => {
          const result = getMockScanResult();
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              from: 'bot' as const,
              text:
                `🧹 Sweeping wallet for hidden value...\n\n` +
                `✨ Airdrops: ${result.airdrops.map(a => `$${a.amount} ${a.name}`).join(', ')}\n` +
                `💨 Dust: $${result.dust}\n` +
                `🌱 Staking rewards: $${result.staking}\n` +
                `\n💰 Total: $${result.total}!` +
                `\n\nYou have ${MAX_FREE_CHECKS - (freeChecksUsed + 1)} free checks remaining!` +
                `\n\nReply 'Share' to post or 'Claim' for premium.`,
              actions: ['Share', 'Claim'],
            },
          ]);
          setFreeChecksUsed((used) => used + 1);
        }, 1200);
      } else {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              from: 'bot' as const,
              text:
                `🚫 You have used all 5 free checks!\n\n` +
                `Type 'claim' to upgrade and unlock premium features.`,
              actions: ['Claim', 'Main menu'],
            },
          ]);
        }, 1000);
      }
      return;
    }

    // Handle 'Swap' command
    if (textToSend.toLowerCase() === 'swap') {
      if (premium) {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 8).toString(),
              from: 'bot' as const,
              text: `🔄 Swapped $2 in dust to USDC!\n\nNo more tiny tokens—just pure value. ✨`,
              actions: ['Share'],
            },
          ]);
        }, 1000);
      } else {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 9).toString(),
              from: 'bot' as const,
              text: `🔒 Dust swapping is a premium feature! Subscribe for $5/month to unlock it.`,
              actions: ['Pay'],
            },
          ]);
        }, 800);
      }
      return;
    }

    // Handle 'Share' command
    if (textToSend.toLowerCase() === 'share') {
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 10).toString(),
            from: 'bot' as const,
            isShareGraphic: true,
            text: 'I swept $20 with SolSweep! Try it: wa.me/solsweep',
          },
        ]);
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 11).toString(),
              from: 'bot' as const,
              text: '📤 Shared to X and WhatsApp Stories! Your friends will be jealous of your sweep. 😎',
              actions: ['Check [your wallet address]'],
            },
          ]);
        }, 1200);
      }, 800);
      return;
    }

    // If user is premium and types 'check [your wallet address]', always allow unlimited checks
    if (premium && textToSend.toLowerCase().startsWith('check ')) {
      botRespond(() => {
        const result = getMockScanResult();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            from: 'bot' as const,
            text:
              `🧹 Sweeping wallet for hidden value...\n\n` +
              `✨ Airdrops: ${result.airdrops.map(a => `$${a.amount} ${a.name}`).join(', ')}\n` +
              `💨 Dust: $${result.dust}\n` +
              `🌱 Staking rewards: $${result.staking}\n` +
              `\n💰 Total: $${result.total}!` +
              `\n\nReply 'Share' to post or 'Claim' for more.`,
            actions: ['Share', 'Claim'],
          },
        ]);
      }, 1200);
      return;
    }

    // 4. If user types 'add wallet', prompt for address
    if (textToSend.toLowerCase() === 'add wallet') {
      setAwaitingWalletToCheck(false);
      if (wallets.filter(Boolean).length >= maxWallets) {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 20).toString(),
              from: 'bot',
              text: `You've reached your wallet limit (${maxWallets}). Upgrade for more.`,
              actions: ['Check wallet', 'Farm airdrops', 'On Chain Streak'],
            },
          ]);
        }, 600);
      } else {
        setAwaitingAddWallet(true);
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 21).toString(),
              from: 'bot',
              text: 'Please enter your wallet address to add:',
              actions: ['Main menu'],
            },
          ]);
        }, 600);
      }
      return;
    }

    // 6. If user types 'check wallet', show wallet list and ask which to check
    if (textToSend.toLowerCase() === 'check wallet') {
      setAwaitingAddWallet(false);
      setAwaitingWalletToCheck(true);
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 23).toString(),
            from: 'bot',
            text:
              'Here are your added wallets:\n' +
              wallets.map((w, i) => `${i + 1}. ${w ? w.slice(0, 12) + '...' : 'null'}`).join('\n') +
              '\n\nWhich wallet would you like to check?\nReply with the wallet number or paste the address.',
            actions: wallets.filter(Boolean).map((w, i) => `${i + 1}`),
          },
        ]);
      }, 600);
      return;
    }

    // 5. If awaitingAddWallet, add the address
    if (awaitingAddWallet) {
      if (["main menu", "back"].includes(textToSend.toLowerCase())) {
        setAwaitingAddWallet(false);
        botRespond(() => {
          setMessages((prev) => [...prev, getMainMenuMessage()]);
        }, 600);
        return;
      }
      // Accept any non-empty string as a wallet address for mock/demo
      const addr = textToSend;
      if (addr.length > 0) {
        const idx = wallets.findIndex(w => !w);
        if (idx !== -1) {
          const newWallets = [...wallets];
          newWallets[idx] = addr;
          setWallets(newWallets);
          setAwaitingAddWallet(false);
          botRespond(() => {
            setMessages((prev) => [...prev, {
              id: (Date.now() + 22).toString(),
              from: 'bot',
              text: `✅ Wallet added successfully!\nYou can now check this wallet for airdrops and rewards.`,
              actions: ['Add Another Wallet', 'Check My Wallets', 'Farm Airdrops'],
            }]);
          }, 600);
        }
      }
      return;
    }

    // 7. If awaitingWalletToCheck, process wallet selection
    if (awaitingWalletToCheck) {
      if (textToSend.toLowerCase() === 'check all wallets') {
        setAwaitingWalletToCheck(false);
        botRespond(() => {
          const results = wallets.filter(Boolean).map((w, i) => {
            const result = getMockScanResult();
            return `Wallet ${i + 1} (${(w!).slice(0, 12)}...): $${result.total} found`;
          });
        setMessages((prev) => [
          ...prev,
          {
              id: (Date.now() + 24).toString(),
            from: 'bot',
            text:
                `🧹 Sweeping all wallets for hidden value...\n\n` +
                results.join('\n') +
                `\n\nReply with a wallet number to see details, or 'Main menu' to return.`,
            actions: wallets.filter(Boolean).map((w, i) => `${i + 1}`),
          },
        ]);
        }, 1200);
      return;
    }
      if (["main menu", "back"].includes(textToSend.toLowerCase())) {
        setAwaitingWalletToCheck(false);
        botRespond(() => {
          setMessages((prev) => [...prev, getMainMenuMessage()]);
        }, 600);
        return;
      }
      // Accept number or address
      const idx = parseInt(textToSend, 10) - 1;
      let selectedWallet = null;
      if (!isNaN(idx) && wallets[idx]) {
        selectedWallet = wallets[idx];
      } else if (wallets.includes(textToSend)) {
        selectedWallet = textToSend;
      }
      if (selectedWallet) {
        setAwaitingWalletToCheck(false);
        botRespond(() => {
          const result = getMockScanResult();
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 24).toString(),
              from: 'bot',
              text:
                `🧹 Sweeping wallet (${selectedWallet.slice(0, 12)}...) for hidden value...\n\n` +
                `✨ Airdrops: ${result.airdrops.map(a => `$${a.amount} ${a.name}`).join(', ')}\n` +
                `💨 Dust: $${result.dust}\n` +
                `🌱 Staking rewards: $${result.staking}\n` +
                `\n💰 Total: $${result.total}!` +
                `\n\nReply 'Share' to post or 'Claim' for premium.`,
              actions: ['Share', 'Claim'],
            },
          ]);
        }, 1200);
      } else {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 25).toString(),
              from: 'bot',
              text: 'Sorry, I didn\'t recognize that selection.\nPlease reply with the wallet number or paste the wallet address you want to check.',
              actions: wallets.filter(Boolean).map((w, i) => `${i + 1}`),
            },
          ]);
        }, 600);
      }
      return;
    }

    // 8. If user types 'check {wallet address}', handle accordingly
    if (/^check\s+\S+/.test(textToSend.toLowerCase())) {
      const parts = textToSend.split(/\s+/);
      if (parts.length === 2) {
        const addr = parts[1];
        if (wallets.includes(addr)) {
          // Wallet is registered, check it directly
          botRespond(() => {
            const result = getMockScanResult();
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 27).toString(),
                from: 'bot',
                text:
                  `🧹 Sweeping wallet (${addr.slice(0, 12)}...) for hidden value...\n\n` +
                  `✨ Airdrops: ${result.airdrops.map(a => `$${a.amount} ${a.name}`).join(', ')}\n` +
                  `💨 Dust: $${result.dust}\n` +
                  `🌱 Staking rewards: $${result.staking}\n` +
                  `\n💰 Total: $${result.total}!` +
                  `\n\nReply 'Share' to post or 'Claim' for premium.`,
                actions: ['Share', 'Claim'],
              },
            ]);
          }, 1200);
        } else {
          // Wallet not registered, prompt to add
          botRespond(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 28).toString(),
                from: 'bot',
                text: `This wallet is not recognised. Would you like to add it? (Reply 'yes' to add or 'no' to cancel)`,
                actions: ['Yes', 'No'],
              },
            ]);
          }, 600);
          setPendingAddWallet(addr);
        }
      } else {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 26).toString(),
              from: 'bot',
              text: `Please use 'Check wallet' to select from your added wallets or 'check {wallet address}' to check a specific wallet.`,
              actions: ['Check wallet', 'Add wallet'],
            },
          ]);
        }, 600);
      }
      return;
    }

    // Handle pending add wallet confirmation
    if (pendingAddWallet) {
      if (textToSend.toLowerCase() === 'yes') {
        if (wallets.filter(Boolean).length >= maxWallets) {
          setPendingAddWallet(null);
          botRespond(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 29).toString(),
                from: 'bot',
                text: `You've reached your wallet limit (${maxWallets}). Upgrade for more.`,
                actions: ['Check wallet', 'Farm airdrops'],
              },
            ]);
          }, 600);
        } else {
          const idx = wallets.findIndex(w => !w);
          if (idx !== -1) {
            const newWallets = [...wallets];
            newWallets[idx] = pendingAddWallet;
            setWallets(newWallets);
            setPendingAddWallet(null);
            botRespond(() => {
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 30).toString(),
                  from: 'bot',
                  text: `✅ Wallet added successfully!\nYou can now check this wallet for airdrops and rewards.`,
                  actions: ['Add Another Wallet', 'Check My Wallets', 'Farm Airdrops'],
                },
              ]);
            }, 600);
          }
        }
        return;
      } else if (textToSend.toLowerCase() === 'no' || ["main menu", "back"].includes(textToSend.toLowerCase())) {
        setPendingAddWallet(null);
        botRespond(() => {
          setMessages((prev) => [...prev, getMainMenuMessage()]);
        }, 600);
        return;
      }
      // If not yes/no, prompt again
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 31).toString(),
            from: 'bot',
            text: `Please reply 'yes' to add this wallet or 'no' to cancel.`,
            actions: ['Yes', 'No'],
          },
        ]);
      }, 600);
      return;
    }

    // 2. Handle 'On Chain Streak' main menu action
    if (textToSend.toLowerCase() === 'on chain streak') {
      if (wallets.filter(Boolean).length > 1) {
        botRespond(() => {
      setMessages((prev) => [
        ...prev,
        {
              id: (Date.now() + 1000).toString(),
              from: 'bot',
              text: 'Which wallet would you like to check for your on-chain streak?\n' +
                wallets.map((w, i) => `${i + 1}. ${w ? w.slice(0, 12) + '...' : 'null'}`).join('\n'),
              actions: wallets.filter(Boolean).map((w, i) => `${i + 1}`),
        },
      ]);
        }, 600);
        return;
      } else {
        // Only one wallet, show streak summary directly
        const wallet = wallets.find(Boolean) as string;
        const streak = Math.floor(Math.random() * 10) + 3;
        const longest = streak + Math.floor(Math.random() * 10);
        const total = longest + Math.floor(Math.random() * 10);
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1001).toString(),
              from: 'bot',
              text: `🔥 On-Chain Streak for wallet ${wallet.slice(0, 12)}...\n- Current streak: ${streak} days\n- Longest streak: ${longest} days\n- Total active days: ${total}\n- Time frame: Last 30 days\n\nType a new time frame (e.g. 'last 7 days', 'last 90 days') to update.`,
            },
          ]);
        }, 800);
        return;
      }
    }
    // 3. Handle wallet selection for streak
    if (wallets.filter(Boolean).length > 1 && wallets.filter(Boolean).map((w, i) => `${i + 1}`).includes(textToSend) && messages[messages.length-1]?.text?.includes('on-chain streak')) {
      const idx = parseInt(textToSend, 10) - 1;
      const wallet = wallets[idx]!;
      const streak = Math.floor(Math.random() * 10) + 3;
      const longest = streak + Math.floor(Math.random() * 10);
      const total = longest + Math.floor(Math.random() * 10);
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1002).toString(),
            from: 'bot',
            text: `🔥 On-Chain Streak for wallet ${wallet.slice(0, 12)}...\n- Current streak: ${streak} days\n- Longest streak: ${longest} days\n- Total active days: ${total}\n- Time frame: Last 30 days\n\nType a new time frame (e.g. 'last 7 days', 'last 90 days') to update.`,
          },
        ]);
      }, 800);
      return;
    }
    // 4. Handle time frame update for streak
    if (/last \d+ days/i.test(textToSend) && messages[messages.length-1]?.text?.includes('On-Chain Streak')) {
      const days = textToSend.match(/last (\d+) days/i)?.[1] || '30';
      const streak = Math.floor(Math.random() * 10) + 3;
      const longest = streak + Math.floor(Math.random() * 10);
      const total = longest + Math.floor(Math.random() * 10);
      const wallet = (messages[messages.length-1]?.text?.match(/wallet ([A-Za-z0-9]+)/)?.[1] || 'your wallet');
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1003).toString(),
            from: 'bot',
            text: `🔥 On-Chain Streak for wallet ${wallet}...\n- Current streak: ${streak} days\n- Longest streak: ${longest} days\n- Total active days: ${total}\n- Time frame: Last ${days} days\n\nType a new time frame (e.g. 'last 7 days', 'last 90 days') to update.`,
          },
        ]);
      }, 800);
      return;
    }
    // 5. Simulate platform volume and staking queries
    const volumeMatch = textToSend.match(/how much have i swapped on ([a-z0-9 ]+)(?: for the last (\d+) days)?/i) || textToSend.match(/show my transaction volume on ([a-z0-9 ]+)(?: for the last (\d+) days)?/i);
    if (volumeMatch) {
      const platform = volumeMatch[1].trim();
      const days = volumeMatch[2] || '30';
      const total = (Math.floor(Math.random() * 2000) + 200).toLocaleString();
      const swaps = Math.floor(Math.random() * 20) + 1;
      const largest = (Math.floor(Math.random() * 500) + 50).toLocaleString();
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1004).toString(),
            from: 'bot',
            text: `📊 Transaction Volume for ${platform.charAt(0).toUpperCase() + platform.slice(1)} (last ${days} days):\n- Total swapped: $${total}\n- Number of swaps: ${swaps}\n- Largest swap: $${largest}`,
          },
        ]);
      }, 800);
      return;
    }
    const stakeMatch = textToSend.match(/how much have i staked on ([a-z0-9 ]+)/i) || textToSend.match(/show my total staked on ([a-z0-9 ]+)/i);
    if (stakeMatch) {
      const platform = stakeMatch[1].trim();
      const total = (Math.floor(Math.random() * 3000) + 500).toLocaleString();
      const actions = Math.floor(Math.random() * 5) + 1;
      const longest = Math.floor(Math.random() * 60) + 10;
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1005).toString(),
            from: 'bot',
            text: `🏦 Total Staked on ${platform.charAt(0).toUpperCase() + platform.slice(1)}:\n- $${total} currently staked\n- ${actions} staking actions in the last 90 days\n- Longest single stake: ${longest} days`,
          },
        ]);
      }, 800);
      return;
    }

    // Support 'how much have I deposited?' (no platform) if an airdrop is selected
    const depositCurrentMatch = textToSend.match(/^how much have i deposited\s*\??\s*$/i);
    if (depositCurrentMatch) {
      if (currentAirdrop) {
        const platform = currentAirdrop;
        const total = (Math.floor(Math.random() * 3000) + 100).toLocaleString();
        const actions = Math.floor(Math.random() * 5) + 1;
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 3002).toString(),
              from: 'bot',
              text: `🏦 Total Deposited in ${platform} vault:\n- $${total} deposited (simulated)\n- ${actions} deposit actions in the last 90 days`,
            },
          ]);
        }, 800);
      } else {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 3003).toString(),
              from: 'bot',
              text: 'Please select an airdrop to farm first (e.g., type "Farm airdrops" and pick one).',
            },
          ]);
        }, 600);
      }
      return;
    }
    // Add support for 'how much have I deposited in [platform] vault?' command
    const depositQueryMatch = textToSend.match(/how much have i deposited in ([a-z0-9 ]+)(?: vault)?/i);
    if (depositQueryMatch) {
      const platform = depositQueryMatch[1].trim();
      const total = (Math.floor(Math.random() * 3000) + 100).toLocaleString();
      const actions = Math.floor(Math.random() * 5) + 1;
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 3001).toString(),
            from: 'bot',
            text: `🏦 Total Deposited in ${platform.charAt(0).toUpperCase() + platform.slice(1)} vault:\n- $${total} deposited (simulated)\n- ${actions} deposit actions in the last 90 days`,
          },
        ]);
      }, 800);
      return;
    }

    // Simulate airdrop action commands (deposit, stake, provide liquidity, etc.) only if currentAirdrop is set
    const depositMatch = textToSend.match(/deposit \$?(\d+(?:\.\d+)?) (?:into|to) ([a-z0-9 ]+)(?: vault)?/i);
    if (depositMatch) {
      if (!currentAirdrop) {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 2101).toString(), from: 'bot', text: 'Please select an airdrop to farm first (e.g., type "Farm airdrops" and pick one).' },
          ]);
        }, 600);
        return;
      }
      const amount = depositMatch[1];
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 2001).toString(), from: 'bot', text: `📝 To deposit $${amount} into ${currentAirdrop} vault, you'll need to sign a transaction in your wallet.\n\n1. Click the button below to open your wallet and review the transaction.\n2. Approve the transaction to complete the deposit.\n\n[Sign Transaction]\n\n*Note: Never share your private key. SolSweep will never ask for it!*`, actions: ['Sign Transaction'] },
        ]);
      }, 800);
      return;
    }
    const stakeMatch2 = textToSend.match(/stake \$?(\d+(?:\.\d+)?) (?:worth of )?\$?([a-z0-9]+)/i);
    if (stakeMatch2) {
      if (!currentAirdrop) {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 2102).toString(), from: 'bot', text: 'Please select an airdrop to farm first (e.g., type "Farm airdrops" and pick one).' },
          ]);
        }, 600);
        return;
      }
      const amount = stakeMatch2[1];
      const token = stakeMatch2[2].toUpperCase();
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 2002).toString(), from: 'bot', text: `📝 To stake $${amount} worth of $${token} in ${currentAirdrop}, you'll need to sign a transaction in your wallet.\n\n1. Click the button below to open your wallet and review the transaction.\n2. Approve the transaction to complete staking.\n\n[Sign Transaction]\n\n*Note: Never share your private key. SolSweep will never ask for it!*`, actions: ['Sign Transaction'] },
        ]);
      }, 800);
      return;
    }
    const provideLiquidityMatch = textToSend.match(/provide liquidity (?:to|on|for) ([a-z0-9 ]+)/i);
    if (provideLiquidityMatch) {
      if (!currentAirdrop) {
        botRespond(() => {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 2103).toString(), from: 'bot', text: 'Please select an airdrop to farm first (e.g., type "Farm airdrops" and pick one).' },
          ]);
        }, 600);
        return;
      }
      botRespond(() => {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 2003).toString(), from: 'bot', text: `📝 To provide liquidity to ${currentAirdrop}, you'll need to sign a transaction in your wallet.\n\n1. Click the button below to open your wallet and review the transaction.\n2. Approve the transaction to complete providing liquidity.\n\n[Sign Transaction]\n\n*Note: Never share your private key. SolSweep will never ask for it!*`, actions: ['Sign Transaction'] },
        ]);
      }, 800);
      return;
    }

  };

  const renderItem = ({ item }: ListRenderItemInfo<ChatMessage>) => {
    if (item.isShareGraphic) {
      return (
        <View style={styles.shareGraphic}>
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
                <TouchableOpacity
                  key={action + idx}
                  style={styles.optionButton}
                  onPress={() => handleSend(action)}
                >
                  <Text style={styles.optionButtonText}>{action}</Text>
                </TouchableOpacity>
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
              <TouchableOpacity
                key={action + idx}
                style={styles.optionButton}
                onPress={() => handleSend(action)}
              >
                <Text style={styles.optionButtonText}>{action}</Text>
              </TouchableOpacity>
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
        "👋 Welcome to SolSweep!\nLet's help you discover hidden value in your Solana wallet." +
        "\nAdded wallets:\n" +
        wallets.map((w, i) => `${i + 1}. ${w ? w.slice(0, 12) + '...' : 'null'}`).join('\n') +
        "\n\nTry typing 'Farm airdrops' to see airdrop opportunities, or 'On Chain Streak' to view your activity streak.",
      actions: ['Add Wallet', 'Check My Wallets', 'Farm Airdrops', 'On Chain Streak'],
    };
  }

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      {/* Multi-stop diagonal gradient background */}
      <LinearGradient
        colors={["#4E342E", "#6D4C41", "#A1887F", "#FFD700"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[styles.container, { flex: 1, minHeight: 0 }]}> 
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
          <View style={[styles.chatArea, { flex: 1 }]}>
            <FlatList
              ref={flatListRef}
              style={{ flex: 1 }}
              data={messages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.chatContainer, { flexGrow: 1, paddingBottom: 24 }]}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            />
            {/* Typing indicator */}
            {botTyping && (
              <View style={{ marginLeft: 12, marginBottom: 8 }}>
                <View style={{
                  backgroundColor: BEIGE,
                  borderRadius: 16,
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  alignSelf: 'flex-start',
                  borderWidth: 1,
                  borderColor: '#A1887F',
                }}>
                  <Text style={{ color: BROWN, fontWeight: 'bold', fontSize: 15 }}>Bot is typing…</Text>
                </View>
              </View>
            )}
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
                  onSubmitEditing={() => handleSend()}
                  returnKeyType="send"
                />
                <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
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
    minHeight: 0,
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
