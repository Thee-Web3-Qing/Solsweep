import { Connection, PublicKey } from '@solana/web3.js';

// In-memory user data store (for dev/demo only)
const userWallets = {};
const userStatus = {};

const AIRDROPS = [
  {
    name: 'Jupiter',
    guide: 'Jupiter Airdrop Guide:\n1. Swap tokens on Jupiter aggregator.\n2. Provide liquidity to eligible pools.\n3. Hold JUP tokens in your wallet.\n4. Follow Jupiter on X for updates.\n5. Check eligibility at jup.ag/airdrop.\n\nTip: The more you swap, the higher your chances!\n\nOfficial site: https://jup.ag',
    suggestions: [
      'deposit $50 into Jupiter aggregator',
      'swap tokens on Jupiter',
      'check Jupiter eligibility'
    ]
  },
  {
    name: 'Kamino',
    guide: 'Kamino Airdrop Guide:\n1. Deposit assets into Kamino vaults.\n2. Stake KMNO tokens.\n3. Participate in governance.\n4. Use Kamino leverage features.\n5. Stay active in the Kamino Discord.\n\nTip: Early users and stakers are prioritized!\n\nOfficial site: https://kamino.finance',
    suggestions: [
      'deposit into Kamino vault',
      'stake KMNO',
      'check Kamino eligibility'
    ]
  },
  {
    name: 'Bonk',
    guide: 'Bonk Airdrop Guide:\n1. Hold BONK tokens in your wallet.\n2. Interact with Bonk dApps.\n3. Join Bonk community events.\n4. Complete Bonk quests.\n5. Follow Bonk on X for airdrop news.\n\nTip: Community engagement increases your chances!\n\nOfficial site: https://bonk.com',
    suggestions: [
      'hold BONK tokens',
      'join Bonk event',
      'check Bonk eligibility'
    ]
  },
  {
    name: 'Sanctum',
    guide: 'Sanctum Airdrop Guide:\n1. Stake SOL with Sanctum.\n2. Use Sanctum liquid staking.\n3. Refer friends to Sanctum.\n4. Hold staked assets for longer periods.\n5. Check eligibility at sanctum.so.\n\nTip: Long-term stakers are rewarded!\n\nOfficial site: https://sanctum.so',
    suggestions: [
      'stake SOL with Sanctum',
      'refer a friend to Sanctum',
      'check Sanctum eligibility'
    ]
  },
  {
    name: 'Meteora',
    guide: 'Meteora Airdrop Guide:\n1. Provide liquidity on Meteora.\n2. Stake LP tokens.\n3. Use Meteora vaults.\n4. Participate in Meteora governance.\n5. Stay active in the Meteora Telegram.\n\nTip: Active liquidity providers get the most rewards!\n\nOfficial site: https://meteora.ag',
    suggestions: [
      'provide liquidity on Meteora',
      'stake LP tokens',
      'check Meteora eligibility'
    ]
  }
];

const WALLET_CHECK_LIMIT_FREE = 5;
const WALLET_LIMIT_FREE = 2;
const WALLET_LIMIT_PREMIUM = 5;
const PREMIUM_PRICE = 5; // $5
const PAYMENT_WALLET = '7x9abc123EXAMPLEWALLETADDRESSFORDEMO123456789';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/hlXtR9rLYqhvkX1hhb1q1suPJ269d4wv';
const solanaConnection = new Connection(SOLANA_RPC_URL);

function isValidSolanaAddress(address) {
  // Solana addresses are base58, 32-44 chars, start with a letter or number
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

function getMockScanResult(address) {
  // Return a mock scan result for the wallet
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
}

function getMockStreak(days = 30) {
  // Return a mock streak summary
  const streak = Math.floor(Math.random() * 10) + 3;
  const longest = streak + Math.floor(Math.random() * 10);
  const total = Math.floor(days * 0.7) + Math.floor(Math.random() * 5);
  return { streak, longest, total, days };
}

// Helper to fetch SPL token balances for a wallet
async function getSplTokenBalances(pubkey, connection) {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') });
  const tokens = [];
  for (const { account } of tokenAccounts.value) {
    const info = account.data.parsed.info;
    const mint = info.mint;
    const amount = info.tokenAmount.uiAmount;
    if (amount > 0) {
      tokens.push({ mint, amount });
    }
  }
  return tokens;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, message } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  const text = (message || '').trim();

  // Initialize user wallet list and status if not present
  if (!userWallets[userId]) userWallets[userId] = [];
  if (!userStatus[userId]) userStatus[userId] = { freeChecksUsed: 0, premium: false, awaitingPayment: false };
  const { freeChecksUsed, premium, awaitingPayment } = userStatus[userId];
  const maxWallets = premium ? WALLET_LIMIT_PREMIUM : WALLET_LIMIT_FREE;

  // Step: Handle payment hash after 'pay' command
  if (awaitingPayment) {
    if (/^main menu$/i.test(text) || /^back$/i.test(text)) {
      userStatus[userId].awaitingPayment = false;
      return res.status(200).json({
        response: 'Back to main menu. What would you like to do?',
        actions: ['Add wallet', 'Check wallet', 'Farm airdrops', 'On Chain Streak']
      });
    }
    // For demo, treat any non-empty string as a valid hash
    if (text.length > 0) {
      userStatus[userId].premium = true;
      userStatus[userId].awaitingPayment = false;
      return res.status(200).json({
        response: `✅ Payment received and verified! You are now a SolSweep Premium member.\n\nEnjoy unlimited wallet checks and up to 5 wallets!`,
        actions: ['Add wallet', 'Check wallet', 'Farm airdrops', 'On Chain Streak']
      });
    } else {
      return res.status(200).json({
        response: '❌ Please enter a transaction hash to continue.',
        actions: ['Send transaction hash', 'Main menu']
      });
    }
  }

  // Step: Pay command to start upgrade
  if (/^pay$/i.test(text)) {
    userStatus[userId].awaitingPayment = true;
    return res.status(200).json({
      response: `🚫 You have used all ${WALLET_CHECK_LIMIT_FREE} free checks or reached the free wallet limit!\n\nUnlock unlimited wallet checks and up to 5 wallets for just $${PREMIUM_PRICE}/month!\n\nTo upgrade, please send $${PREMIUM_PRICE} (in USDC or USDT) to the following wallet address on Solana Mainnet:\nWallet: ${PAYMENT_WALLET}\nNetwork: Solana Mainnet\nAmount: $${PREMIUM_PRICE} USDC or USDT\n\nAfter sending, reply with your transaction hash for verification. 🏆`,
      actions: ['Send transaction hash', 'Main menu']
    });
  }

  // Step 2: Add wallet flow
  if (/^add wallet$/i.test(text)) {
    if (userWallets[userId].length >= maxWallets) {
      if (!premium) {
        return res.status(200).json({
          response: `Free users can add up to ${WALLET_LIMIT_FREE} wallets. Upgrade to premium for up to ${WALLET_LIMIT_PREMIUM} wallets!`,
          actions: ['Pay', 'Main menu']
        });
      } else {
        return res.status(200).json({
          response: `You have reached the maximum of ${WALLET_LIMIT_PREMIUM} wallets for premium users.`,
          actions: ['Main menu']
        });
      }
    }
    return res.status(200).json({
      response: 'Please enter your Solana wallet address to add:',
      actions: []
    });
  }

  // Step 3: Check wallet flow
  if (/^check wallet$/i.test(text)) {
    if (!userWallets[userId].length) {
      return res.status(200).json({
        response: 'You have not added any wallets yet. Please add a wallet first.',
        actions: ['Add wallet']
      });
    }
    if (!premium && freeChecksUsed >= WALLET_CHECK_LIMIT_FREE) {
      return res.status(200).json({
        response: `You have used all ${WALLET_CHECK_LIMIT_FREE} free wallet checks. Upgrade to premium for unlimited checks!`,
        actions: ['Pay', 'Main menu']
      });
    }
    return res.status(200).json({
      response: 'Which wallet would you like to check?\n' +
        userWallets[userId].map((w, i) => `${i + 1}. ${w}`).join('\n'),
      actions: userWallets[userId]
    });
  }

  // If the message is a valid Solana address, check if it's in the user's wallet list
  if (isValidSolanaAddress(text)) {
    // Add wallet address (if not already present and not at limit)
    if (!userWallets[userId].includes(text) && userWallets[userId].length < maxWallets) {
      userWallets[userId].push(text);
      return res.status(200).json({
        response: `✅ Wallet added: ${text}\n\nWhat would you like to do next?`,
        actions: ['Add wallet', 'Check wallet', 'Farm airdrops', 'On Chain Streak']
      });
    }
    // Check wallet scan (if in user's wallet list)
    if (userWallets[userId].includes(text)) {
      if (!premium && freeChecksUsed >= WALLET_CHECK_LIMIT_FREE) {
        return res.status(200).json({
          response: `You have used all ${WALLET_CHECK_LIMIT_FREE} free wallet checks. Upgrade to premium for unlimited checks!`,
          actions: ['Pay', 'Main menu']
        });
      }
      // Increment freeChecksUsed for free users
      if (!premium) userStatus[userId].freeChecksUsed++;
      // Fetch real SOL balance from Solana
      let solBalance = 0;
      try {
        const pubkey = new PublicKey(text);
        const lamports = await solanaConnection.getBalance(pubkey);
        solBalance = lamports / 1e9;
      } catch (e) {
        return res.status(200).json({
          response: `❌ Error fetching wallet balance. Please check the address and try again.`,
          actions: ['Check wallet', 'Main menu']
        });
      }
      return res.status(200).json({
        response:
          `🔍 Scan results for wallet ${text.slice(0, 12)}...\n` +
          `SOL Balance: ${solBalance}\n` +
          `\nWhat would you like to do next?`,
        actions: ['Check wallet', 'Farm airdrops', 'On Chain Streak']
      });
    }
    // Address not in user's wallet list
    if (!userWallets[userId].includes(text)) {
      if (!userWallets[userId].length) {
        return res.status(200).json({
          response: 'You have not added any wallets yet. Please add a wallet first.',
          actions: ['Add wallet']
        });
      }
      return res.status(200).json({
        response: 'This wallet is not in your list. Please select one of your added wallets:\n' +
          userWallets[userId].map((w, i) => `${i + 1}. ${w}`).join('\n'),
        actions: userWallets[userId]
      });
    }
  }

  // Step 4: Farm airdrops flow
  if (/^farm airdrops$/i.test(text)) {
    return res.status(200).json({
      response: 'Which airdrop would you like to learn about?\n' +
        AIRDROPS.map((a, i) => `${i + 1}. ${a.name}`).join('\n'),
      actions: AIRDROPS.map(a => a.name)
    });
  }

  // If the message matches an airdrop name, return its guide and suggestions
  const selectedAirdrop = AIRDROPS.find(a => a.name.toLowerCase() === text.toLowerCase());
  if (selectedAirdrop) {
    return res.status(200).json({
      response: selectedAirdrop.guide + '\n\nYou can try these commands:',
      actions: selectedAirdrop.suggestions
    });
  }

  // Step 5: On Chain Streak flow
  if (/^on chain streak$/i.test(text)) {
    const wallets = userWallets[userId];
    if (!wallets.length) {
      return res.status(200).json({
        response: 'You have not added any wallets yet. Please add a wallet first.',
        actions: ['Add wallet']
      });
    }
    if (wallets.length === 1) {
      // Only one wallet, show streak summary directly
      const streakData = getMockStreak();
      return res.status(200).json({
        response: `🔥 On-Chain Streak for wallet ${wallets[0].slice(0, 12)}...\n- Current streak: ${streakData.streak} days\n- Longest streak: ${streakData.longest} days\n- Total active days: ${streakData.total}\n- Time frame: Last ${streakData.days} days\n\nType a new time frame (e.g. 'last 7 days', 'last 90 days') to update.`,
        actions: []
      });
    }
    // Multiple wallets, prompt user to select
    return res.status(200).json({
      response: 'Which wallet would you like to check for your on-chain streak?\n' +
        wallets.map((w, i) => `${i + 1}. ${w}`).join('\n'),
      actions: wallets
    });
  }

  // If the message is a valid Solana address and the last action was 'On Chain Streak', show streak summary
  // For MVP, just check if the address is in the user's wallet list and the previous message was 'On Chain Streak'
  // (In production, track last action in user session)
  if (isValidSolanaAddress(text) && userWallets[userId].includes(text)) {
    // Check if user is likely in the streak flow by looking for 'On Chain Streak' in the previous message
    // (In a real app, use session state)
    // We'll allow time frame update below, so just show streak summary here
    const streakData = getMockStreak();
    return res.status(200).json({
      response: `🔥 On-Chain Streak for wallet ${text.slice(0, 12)}...\n- Current streak: ${streakData.streak} days\n- Longest streak: ${streakData.longest} days\n- Total active days: ${streakData.total}\n- Time frame: Last ${streakData.days} days\n\nType a new time frame (e.g. 'last 7 days', 'last 90 days') to update.`,
      actions: []
    });
  }

  // If the user sends a time frame update (e.g. 'last 7 days'), show updated streak
  const timeFrameMatch = text.match(/^last (\d+) days$/i);
  if (timeFrameMatch) {
    const days = parseInt(timeFrameMatch[1], 10);
    // For MVP, just use the first wallet in the list
    const wallets = userWallets[userId];
    if (!wallets.length) {
      return res.status(200).json({
        response: 'You have not added any wallets yet. Please add a wallet first.',
        actions: ['Add wallet']
      });
    }
    const streakData = getMockStreak(days);
    return res.status(200).json({
      response: `🔥 On-Chain Streak for wallet ${wallets[0].slice(0, 12)}...\n- Current streak: ${streakData.streak} days\n- Longest streak: ${streakData.longest} days\n- Total active days: ${streakData.total}\n- Time frame: Last ${streakData.days} days\n\nType a new time frame (e.g. 'last 7 days', 'last 90 days') to update.`,
      actions: []
    });
  }

  // Step: Help command
  if (/^help$/i.test(text)) {
    return res.status(200).json({
      response:
        'Here are some things you can do with SolSweep:\n' +
        '- Add wallet: Add a Solana wallet to your profile.\n' +
        '- Check wallet: Scan your wallet for airdrops, dust, and staking.\n' +
        '- Farm airdrops: Get guides for popular Solana airdrops.\n' +
        '- On Chain Streak: View your wallet activity streak.\n' +
        '- Pay: Upgrade to premium for more features.\n' +
        '\nJust type a command or select an option!',
      actions: ['Add wallet', 'Check wallet', 'Farm airdrops', 'On Chain Streak', 'Pay']
    });
  }

  // Step: Mock claim command (prompt to sign transaction)
  if (/^claim$/i.test(text)) {
    return res.status(200).json({
      response: 'To claim your airdrop, please click "Claim Airdrop" below and sign the transaction in your wallet.',
      actions: ['Claim Airdrop', 'Main menu']
    });
  }

  // Step: Mock claim airdrop action (redirect to wallet)
  if (/^claim airdrop$/i.test(text)) {
    return res.status(200).json({
      response: 'To complete your claim, click the link below to open your wallet and sign the transaction:\n\n[Open Wallet to Sign](https://solflare.com/)\n\nAfter signing, come back and click \'I\'ve signed\' below.',
      actions: ["I've signed", 'Main menu']
    });
  }

  // Step: Mock "I've signed" action
  if (/^i'?ve signed$/i.test(text)) {
    return res.status(200).json({
      response: '🎉 Transaction signed! Your airdrop has been claimed. (This is a mock response.)',
      actions: ['Share', 'Main menu']
    });
  }

  // Step: Mock share command
  if (/^share$/i.test(text)) {
    return res.status(200).json({
      response: '📤 Your results have been shared! (This is a mock response.)',
      actions: ['Main menu']
    });
  }

  // Step: On-chain interaction for airdrop suggestion commands
  // Check if the message matches any airdrop suggestion
  const onChainCommand = AIRDROPS.flatMap(a => a.suggestions).find(cmd => cmd.toLowerCase() === text.toLowerCase());
  if (onChainCommand) {
    return res.status(200).json({
      response: 'To complete this action, please click "Sign in Wallet" below and sign the transaction in your wallet.',
      actions: ['Sign in Wallet', 'Main menu']
    });
  }

  // Step: Mock sign in wallet action
  if (/^sign in wallet$/i.test(text)) {
    return res.status(200).json({
      response: '✅ Transaction signed! Your on-chain action is complete. (This is a mock response.)',
      actions: ['Main menu']
    });
  }

  // Step: Unknown command (error handling)
  // If none of the above matched, show a helpful error and suggest main actions
  return res.status(200).json({
    response: `Sorry, I didn't understand that. Type 'help' to see what I can do, or choose an option below.`,
    actions: ['Add wallet', 'Check wallet', 'Farm airdrops', 'On Chain Streak', 'Pay']
  });
} 