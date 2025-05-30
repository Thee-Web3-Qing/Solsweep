require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { Connection, PublicKey } = require('@solana/web3.js');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Admin configuration
const ADMIN_IDS = [process.env.ADMIN_TELEGRAM_ID]; // Add your Telegram ID to .env file
const manualAirdrops = {};

// Load manual airdrops on startup
try {
  if (fs.existsSync('manual_airdrops.json')) {
    const data = fs.readFileSync('manual_airdrops.json', 'utf8');
    Object.assign(manualAirdrops, JSON.parse(data));
  }
} catch (e) {
  console.error('[ERROR] Loading manual airdrops:', e);
}

// Add new airdrops
const newAirdrops = {
  'layerzero': {
    name: 'LayerZero',
    description: 'LayerZero is a blockchain interoperability protocol enabling seamless communication between different blockchain networks. It supports decentralized applications (dApps) by providing a framework for cross-chain operations.',
    tasks: [
      {
        id: 'stargate',
        name: 'Use Stargate Finance',
        description: 'Stake STG tokens, provide liquidity, or swap tokens on Stargate Finance',
        target: 1,
        url: 'https://stargate.finance'
      },
      {
        id: 'transfer',
        name: 'Cross-chain Transfers',
        description: 'Move tokens to the LayerZero network to demonstrate active usage',
        target: 1,
        url: 'https://layerzero.network'
      },
      {
        id: 'governance',
        name: 'Participate in Governance',
        description: 'Vote in governance proposals on LayerZero protocols',
        target: 1,
        url: 'https://snapshot.org/#/stgdao.eth'
      }
    ],
    website: 'https://layerzero.network',
    twitter: 'https://twitter.com/LayerZero_Labs',
    discord: 'https://discord.gg/layerzero'
  },
  'pumpfun': {
    name: 'Pump.fun',
    description: 'Pump.fun is a Solana-based platform for creating and trading memecoins, known for its user-friendly interface and innovative features. It has generated over $1.9M in revenue.',
    tasks: [
      {
        id: 'create',
        name: 'Create Memecoin',
        description: 'Create your own memecoin on Pump.fun',
        target: 1,
        url: 'https://pump.fun/create'
      },
      {
        id: 'trade',
        name: 'Trade Memecoins',
        description: 'Trade memecoins on the platform',
        target: 3,
        url: 'https://pump.fun/trade'
      },
      {
        id: 'advanced',
        name: 'Use Advanced Features',
        description: 'Utilize the trading terminal for real-time updates and advanced filters',
        target: 1,
        url: 'https://pump.fun/advanced'
      }
    ],
    website: 'https://pump.fun',
    twitter: 'https://twitter.com/pumpfun',
    discord: 'https://discord.gg/pumpfun'
  },
  'shardeum': {
    name: 'Shardeum',
    description: 'Shardeum is an EVM-based Layer 1 blockchain using sharding to process transactions at up to 2,000 per second. It operates on Proof-of-Stake and Proof-of-Quorum consensus.',
    tasks: [
      {
        id: 'testnet',
        name: 'Testnet Activities',
        description: 'Perform transactions on the Shardeum testnet',
        target: 5,
        url: 'https://docs.shardeum.org/network/endpoints'
      },
      {
        id: 'dapps',
        name: 'Interact with dApps',
        description: 'Use dApps deployed on Shardeum testnet',
        target: 2,
        url: 'https://shardeum.org/ecosystem'
      },
      {
        id: 'community',
        name: 'Community Engagement',
        description: 'Share your testnet experience on social media',
        target: 1,
        url: 'https://shardeum.org/community'
      }
    ],
    website: 'https://shardeum.org',
    twitter: 'https://twitter.com/shardeum',
    discord: 'https://discord.gg/shardeum'
  },
  'grass': {
    name: 'Grass',
    description: 'Grass is a decentralized web scraping protocol that monetizes unused internet bandwidth for AI data processing. It rewards users with Grass Points convertible to GRASS tokens.',
    tasks: [
      {
        id: 'bandwidth',
        name: 'Share Bandwidth',
        description: 'Connect to the Grass network to share unused internet bandwidth',
        target: 1,
        url: 'https://grass.io'
      },
      {
        id: 'testnet',
        name: 'Testnet Feedback',
        description: 'Provide feedback during testnet phases to earn points',
        target: 1,
        url: 'https://grass.io/testnet'
      },
      {
        id: 'points',
        name: 'Track Points',
        description: 'Monitor your Grass Points on the platform',
        target: 1,
        url: 'https://grass.io/dashboard'
      }
    ],
    website: 'https://grass.io',
    twitter: 'https://twitter.com/grass_io',
    discord: 'https://discord.gg/grass'
  },
  'buzzeum': {
    name: 'BUZZEUM',
    description: 'BUZZEUM is a blockchain project focused on collective governance over machines and robots through a DAO. Its upcoming BUZZ token airdrop has a prize pool of 55,555,555 BUZZ.',
    tasks: [
      {
        id: 'social',
        name: 'Social Media Tasks',
        description: 'Follow BUZZEUM on X and like/repost the airdrop announcement',
        target: 1,
        url: 'https://twitter.com/buzzeum'
      },
      {
        id: 'register',
        name: 'Airdrop Registration',
        description: 'Complete the airdrop registration form',
        target: 1,
        url: 'https://buzzeum.io/airdrop'
      },
      {
        id: 'referral',
        name: 'Share Referral',
        description: 'Share your unique referral link on social media',
        target: 1,
        url: 'https://buzzeum.io/referral'
      }
    ],
    website: 'https://buzzeum.io',
    twitter: 'https://twitter.com/buzzeum',
    discord: 'https://discord.gg/buzzeum'
  }
};

// Merge new airdrops with existing ones
Object.assign(manualAirdrops, newAirdrops);
saveManualAirdrops();

// Function to save manual airdrops
function saveManualAirdrops() {
  try {
    fs.writeFileSync('manual_airdrops.json', JSON.stringify(manualAirdrops, null, 2));
  } catch (e) {
    console.error('[ERROR] Saving manual airdrops:', e);
  }
}

// Set up bot commands
const commands = [
  { command: 'start', description: 'Start the bot and show main menu' },
  { command: 'help', description: 'Show help information' },
  { command: 'addwallet', description: 'Add a Solana wallet to your profile' },
  { command: 'checkwallet', description: 'Check your wallet for airdrops and tokens' },
  { command: 'farmairdrops', description: 'Get guides for popular Solana airdrops' },
  { command: 'stake', description: 'View and access staking options' },
  { command: 'swap', description: 'View and access swap options' },
  { command: 'streak', description: 'View your wallet activity streak' },
  { command: 'upgrade', description: 'Upgrade to premium features' },
  { command: 'admin', description: 'Admin panel for managing airdrops' }
];

// Register commands
bot.setMyCommands(commands);

// Constants
const WALLET_CHECK_LIMIT_FREE = 5;
const WALLET_LIMIT_FREE = 2;
const WALLET_LIMIT_PREMIUM = 5;
const PREMIUM_PRICE = 5; // $5
const PAYMENT_WALLET = process.env.PAYMENT_WALLET;
const USDC_MINT = 'EPjFWdd5AufqSSqeM2q8jG4wGkFAb9ZmXzZ5bY5bK68';
const USDT_MINT = 'Es9vMFrzaCERk8b1zjf6K6y5FQh6F5Q6Q6Q6Q6Q6Q6Q6'; // Official USDT mint on Solana

// Initialize Solana connection
const solanaConnection = new Connection(process.env.SOLANA_RPC_URL);

// In-memory stores
const userWallets = {};
const userStatus = {};
let liveAirdropsCache = { data: [], lastFetch: 0 };
const LIVE_AIRDROPS_CACHE_TTL = 1000 * 60 * 10; // 10 minutes

// Add upcoming airdrops data structure
const upcomingAirdrops = {
  'jupiter': {
    name: 'Jupiter',
    description: 'Jupiter is Solana\'s leading DEX aggregator',
    tasks: [
      {
        id: 'swap',
        name: 'Perform Swaps',
        description: 'Complete at least 3 swaps on Jupiter',
        target: 3,
        url: 'https://jup.ag/swap'
      },
      {
        id: 'limit',
        name: 'Use Limit Orders',
        description: 'Place at least 2 limit orders',
        target: 2,
        url: 'https://jup.ag/limit'
      },
      {
        id: 'bridge',
        name: 'Use Bridge',
        description: 'Bridge assets using Jupiter',
        target: 1,
        url: 'https://jup.ag/bridge'
      }
    ],
    website: 'https://jup.ag',
    twitter: 'https://twitter.com/JupiterExchange',
    discord: 'https://discord.gg/jupiter'
  },
  'marinade': {
    name: 'Marinade Finance',
    description: 'Marinade is the first non-custodial liquid staking protocol on Solana',
    tasks: [
      {
        id: 'stake',
        name: 'Stake SOL',
        description: 'Stake at least 1 SOL',
        target: 1,
        url: 'https://marinade.finance/app/staking'
      },
      {
        id: 'referral',
        name: 'Use Referral',
        description: 'Use a referral code when staking',
        target: 1,
        url: 'https://marinade.finance/app/referral'
      }
    ],
    website: 'https://marinade.finance',
    twitter: 'https://twitter.com/MarinadeFinance',
    discord: 'https://discord.gg/marinade'
  }
};

// Add user progress tracking
const userProgress = {};

// Function to get user's progress for an airdrop
function getUserProgress(chatId, airdropId) {
  if (!userProgress[chatId]) {
    userProgress[chatId] = {};
  }
  if (!userProgress[chatId][airdropId]) {
    userProgress[chatId][airdropId] = {
      tasks: {},
      lastUpdated: Date.now()
    };
  }
  return userProgress[chatId][airdropId];
}

// Function to update user's progress
function updateUserProgress(chatId, airdropId, taskId, progress) {
  const userAirdropProgress = getUserProgress(chatId, airdropId);
  userAirdropProgress.tasks[taskId] = progress;
  userAirdropProgress.lastUpdated = Date.now();
}

// Add streak tracking data structure
const userStreaks = {};

// Function to get user's streak data
function getUserStreak(chatId, airdropId) {
  if (!userStreaks[chatId]) {
    userStreaks[chatId] = {};
  }
  if (!userStreaks[chatId][airdropId]) {
    userStreaks[chatId][airdropId] = {
      txCount: 0,
      volume: 0,
      lastTx: null,
      streakDays: 0,
      lastUpdate: Date.now()
    };
  }
  return userStreaks[chatId][airdropId];
}

// Function to update user's streak
async function updateUserStreak(chatId, airdropId, txAmount = 0) {
  const streak = getUserStreak(chatId, airdropId);
  const now = Date.now();
  
  // Check if this is a new day
  const lastUpdate = new Date(streak.lastUpdate);
  const today = new Date(now);
  const isNewDay = lastUpdate.getDate() !== today.getDate() ||
                  lastUpdate.getMonth() !== today.getMonth() ||
                  lastUpdate.getFullYear() !== today.getFullYear();

  // Update streak
  if (isNewDay) {
    // Check if last transaction was yesterday
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);
    if (streak.lastTx && 
        new Date(streak.lastTx).getDate() === yesterday.getDate() &&
        new Date(streak.lastTx).getMonth() === yesterday.getMonth() &&
        new Date(streak.lastTx).getFullYear() === yesterday.getFullYear()) {
      streak.streakDays++;
    } else {
      streak.streakDays = 1; // Reset streak if missed a day
    }
  }

  // Update transaction data
  streak.txCount++;
  streak.volume += txAmount;
  streak.lastTx = now;
  streak.lastUpdate = now;

  return streak;
}

// Helper Functions
async function fetchLiveAirdrops() {
  const now = Date.now();
  if (liveAirdropsCache.data.length && now - liveAirdropsCache.lastFetch < LIVE_AIRDROPS_CACHE_TTL) {
    return liveAirdropsCache.data;
  }
  try {
    // Fetch from DexScreener
    console.log('[DEBUG] Fetching trending tokens from DexScreener');
    const dexScreenerRes = await fetch('https://api.dexscreener.com/latest/dex/tokens/solana');
    const dexScreenerData = await dexScreenerRes.json();
    console.log('[DEBUG] DexScreener tokens:', dexScreenerData.pairs?.length || 0);

    // Fetch from Solana FM
    console.log('[DEBUG] Fetching token data from Solana FM');
    const solanaFMRes = await fetch('https://api.solana.fm/v0/tokens/trending');
    const solanaFMData = await solanaFMRes.json();
    console.log('[DEBUG] Solana FM tokens:', solanaFMData.tokens?.length || 0);

    // Fetch from Solscan for additional verification
    console.log('[DEBUG] Fetching token data from Solscan');
    const solscanRes = await fetch('https://public-api.solscan.io/token/list?sortBy=volume&direction=desc&limit=20');
    const solscanData = await solscanRes.json();
    console.log('[DEBUG] Solscan tokens:', solscanData?.length || 0);
    
    const seen = new Set();
    const all = [
      ...(dexScreenerData.pairs || []).map(p => ({
        token: {
          mint: p.baseToken.address,
          name: p.baseToken.name,
          symbol: p.baseToken.symbol,
          description: `Price: $${p.priceUsd}, Volume 24h: $${p.volume24h}`,
          website: p.url,
          image: p.baseToken.image,
          verified: p.baseToken.verified || false,
          volume24h: p.volume24h,
          liquidity: p.liquidity?.usd
        }
      })),
      ...(solanaFMData.tokens || []).map(t => ({
        token: {
          mint: t.address,
          name: t.name,
          symbol: t.symbol,
          description: t.description,
          website: t.website,
          image: t.image,
          verified: t.verified || false,
          volume24h: t.volume24h,
          liquidity: t.liquidity
        }
      })),
      ...(solscanData || []).map(t => ({
        token: {
          mint: t.address,
          name: t.name,
          symbol: t.symbol,
          description: `Volume 24h: $${t.volume24h}`,
          website: t.website,
          image: t.image,
          verified: t.verified || false,
          volume24h: t.volume24h,
          liquidity: t.liquidity
        }
      }))
    ].filter(t => {
      const mint = t.token?.mint;
      if (!mint || seen.has(mint)) return false;
      seen.add(mint);
      return true;
    });
    
    // Sort by volume and verification status
    const sortedTokens = all.sort((a, b) => {
      // Prioritize verified tokens
      if (a.token.verified && !b.token.verified) return -1;
      if (!a.token.verified && b.token.verified) return 1;
      
      // Then sort by volume
      const volumeA = parseFloat(a.token.volume24h) || 0;
      const volumeB = parseFloat(b.token.volume24h) || 0;
      return volumeB - volumeA;
    });
    
    const drops = sortedTokens.slice(0, 5).map(t => ({
      name: t.token?.name || 'Unknown',
      symbol: t.token?.symbol || '',
      mint: t.token?.mint,
      guide: t.token?.description || '',
      url: t.token?.website || '',
      image: t.token?.image || '',
      verified: t.token?.verified || false,
      volume24h: t.token?.volume24h || '0',
      liquidity: t.token?.liquidity || '0',
      suggestions: [
        t.token?.website ? 'Visit project site' : '',
        'Check token on Solscan',
        'Check token on DexScreener',
        'Check token on Raydium'
      ].filter(Boolean)
    }));
    
    liveAirdropsCache = { data: drops, lastFetch: now };
    return drops;
  } catch (e) {
    console.error('[ERROR] fetchLiveAirdrops:', e);
    return [];
  }
}

async function getSplTokenBalances(pubkey, connection) {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, { 
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') 
    });
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
  } catch (e) {
    console.error('[ERROR] getSplTokenBalances:', e);
    return [];
  }
}

async function checkWalletEligibility(walletAddress, drops) {
  try {
    // Get token balances from Solana RPC
    const pubkey = new PublicKey(walletAddress);
    const tokens = await getSplTokenBalances(pubkey, solanaConnection);
    
    // Get additional data from Solscan
    const solscanRes = await fetch(`https://public-api.solscan.io/account/tokens?account=${walletAddress}`);
    const solscanData = await solscanRes.json();
    
    // Combine token data
    const allTokens = [
      ...tokens,
      ...(solscanData || []).map(t => ({
        mint: t.tokenAddress,
        amount: t.tokenAmount.uiAmount
      }))
    ];
    
    const eligibleDrops = [];
    for (const drop of drops) {
      const isEligible = allTokens.some(t => t.mint === drop.mint);
      
      if (isEligible) {
        // Get Raydium pool data for potential swaps
        let swapUrl = '';
        try {
          const raydiumRes = await fetch('https://api.raydium.io/v2/main/pairs');
          const raydiumData = await raydiumRes.json();
          const pool = raydiumData.data.find(p => 
            p.baseMint === drop.mint || p.quoteMint === drop.mint
          );
          if (pool) {
            swapUrl = `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${drop.mint}`;
          }
        } catch (e) {
          console.error('[ERROR] Fetching Raydium data:', e);
        }
        
        eligibleDrops.push({
          name: drop.name,
          isEligible: true,
          swapUrl
        });
      } else {
        eligibleDrops.push({
          name: drop.name,
          isEligible: false
        });
      }
    }
    
    return eligibleDrops;
  } catch (e) {
    console.error('[ERROR] checkWalletEligibility:', e);
    return [];
  }
}

// Add new functions for DeFi operations
async function getStakingOptions() {
  try {
    // Get Marinade staking options
    const marinadeRes = await fetch('https://api.marinade.finance/staking/options');
    const marinadeData = await marinadeRes.json();

    // Get Lido staking options
    const lidoRes = await fetch('https://api.lido.fi/v1/protocol/steth/apr/sma');
    const lidoData = await lidoRes.json();

    return {
      marinade: {
        name: 'Marinade Finance',
        apy: marinadeData.apy,
        minStake: marinadeData.minStake,
        url: 'https://marinade.finance/app/staking'
      },
      lido: {
        name: 'Lido',
        apy: lidoData.apr,
        minStake: 0.1, // 0.1 SOL
        url: 'https://stake.lido.fi/'
      }
    };
  } catch (e) {
    console.error('[ERROR] getStakingOptions:', e);
    return null;
  }
}

async function getOrcaPools() {
  try {
    const res = await fetch('https://api.orca.so/pools');
    const data = await res.json();
    return data.pools.map(pool => ({
      name: pool.name,
      tokenA: pool.tokenA,
      tokenB: pool.tokenB,
      apy: pool.apy,
      tvl: pool.tvl,
      url: `https://www.orca.so/pools/${pool.name}`
    }));
  } catch (e) {
    console.error('[ERROR] getOrcaPools:', e);
    return [];
  }
}

async function getRaydiumPools() {
  try {
    const res = await fetch('https://api.raydium.io/v2/main/pairs');
    const data = await res.json();
    return data.data.map(pool => ({
      name: pool.name,
      tokenA: pool.baseMint,
      tokenB: pool.quoteMint,
      apy: pool.apy,
      tvl: pool.tvl,
      url: `https://raydium.io/swap/?inputCurrency=${pool.baseMint}&outputCurrency=${pool.quoteMint}`
    }));
  } catch (e) {
    console.error('[ERROR] getRaydiumPools:', e);
    return [];
  }
}

// Add airdrop tracking sources
async function fetchUpcomingAirdrops() {
  try {
    const airdrops = [];
    
    // Add manual airdrops first
    Object.values(manualAirdrops).forEach(airdrop => {
      airdrops.push({
        ...airdrop,
        tvl: airdrop.tvl || 0
      });
    });
    
    // 1. Fetch from DefiLlama's API for TVL and protocol data
    console.log('[DEBUG] Fetching protocol data from DefiLlama');
    const defiLlamaRes = await fetch('https://api.llama.fi/protocols');
    const defiLlamaData = await defiLlamaRes.json();
    
    // 2. Fetch from Solana FM's trending protocols
    console.log('[DEBUG] Fetching trending protocols from Solana FM');
    const solanaFMRes = await fetch('https://api.solana.fm/v0/protocols/trending');
    const solanaFMData = await solanaFMRes.json();
    
    // 3. Fetch from DexScreener's trending pairs
    console.log('[DEBUG] Fetching trending pairs from DexScreener');
    const dexScreenerRes = await fetch('https://api.dexscreener.com/latest/dex/tokens/solana');
    const dexScreenerData = await dexScreenerRes.json();
    
    // Process DefiLlama data
    const solanaProtocols = defiLlamaData
      .filter(p => p.chain === 'Solana')
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 10);
    
    for (const protocol of solanaProtocols) {
      // Check if protocol has token
      const hasToken = protocol.tokens && protocol.tokens.length > 0;
      
      if (!hasToken) {
        airdrops.push({
          name: protocol.name,
          description: `TVL: $${protocol.tvl.toLocaleString()}`,
          category: 'DeFi Protocol',
          tvl: protocol.tvl,
          website: protocol.url,
          twitter: protocol.twitter,
          discord: protocol.discord,
          tasks: [
            {
              id: 'interact',
              name: 'Interact with Protocol',
              description: 'Use the protocol\'s main features',
              target: 1,
              url: protocol.url
            }
          ]
        });
      }
    }
    
    // Process Solana FM data
    for (const protocol of solanaFMData.protocols || []) {
      if (!protocol.hasToken) {
        airdrops.push({
          name: protocol.name,
          description: protocol.description,
          category: protocol.category,
          tvl: protocol.tvl,
          website: protocol.website,
          twitter: protocol.twitter,
          discord: protocol.discord,
          tasks: protocol.suggestedTasks || [
            {
              id: 'interact',
              name: 'Interact with Protocol',
              description: 'Use the protocol\'s main features',
              target: 1,
              url: protocol.website
            }
          ]
        });
      }
    }
    
    // Process DexScreener data for new tokens
    const newTokens = dexScreenerData.pairs
      .filter(p => {
        const launchDate = new Date(p.pairCreatedAt);
        const now = new Date();
        const daysOld = (now - launchDate) / (1000 * 60 * 60 * 24);
        return daysOld < 7; // Tokens less than 7 days old
      })
      .slice(0, 5);
    
    for (const token of newTokens) {
      airdrops.push({
        name: token.baseToken.name,
        description: `New token with $${token.liquidity.usd.toLocaleString()} liquidity`,
        category: 'New Token',
        tvl: token.liquidity.usd,
        website: token.url,
        tasks: [
          {
            id: 'swap',
            name: 'Swap Token',
            description: 'Perform a swap with this token',
            target: 1,
            url: token.url
          }
        ]
      });
    }
    
    // Remove duplicates and sort by TVL
    const uniqueAirdrops = Array.from(new Map(airdrops.map(item => [item.name, item])).values())
      .sort((a, b) => b.tvl - a.tvl);
    
    // Combine manual and automatic airdrops
    const allAirdrops = [...airdrops, ...uniqueAirdrops];
    
    // Remove duplicates and sort by TVL
    return Array.from(new Map(allAirdrops.map(item => [item.name, item])).values())
      .sort((a, b) => b.tvl - a.tvl);
  } catch (e) {
    console.error('[ERROR] fetchUpcomingAirdrops:', e);
    return Object.values(manualAirdrops); // Return at least manual airdrops if API fails
  }
}

// Utility to reload manual airdrops from disk
function reloadManualAirdrops() {
  try {
    if (fs.existsSync('manual_airdrops.json')) {
      const data = fs.readFileSync('manual_airdrops.json', 'utf8');
      const parsed = JSON.parse(data);
      Object.keys(manualAirdrops).forEach(k => delete manualAirdrops[k]);
      Object.assign(manualAirdrops, parsed);
    }
  } catch (e) {
    console.error('[ERROR] Reloading manual airdrops:', e);
  }
}

// Payment verification function for USDC/USDT
async function verifyPaymentTx(signature, expectedWallet, expectedAmount) {
  try {
    const tx = await solanaConnection.getParsedTransaction(signature, { commitment: 'confirmed' });
    if (!tx) return { valid: false, reason: 'Transaction not found or not confirmed.' };
    let found = false;
    let amount = 0;
    let payer = null;
    let mint = null;
    for (const instr of tx.transaction.message.instructions) {
      if (instr.parsed && instr.parsed.type === 'transfer') {
        const info = instr.parsed.info;
        if (
          info.destination === expectedWallet &&
          (info.mint === USDC_MINT || info.mint === USDT_MINT)
        ) {
          found = true;
          amount = info.amount / 1e6; // USDC/USDT: 6 decimals
          payer = info.source;
          mint = info.mint;
        }
      }
    }
    if (!found) return { valid: false, reason: 'No valid USDC/USDT transfer to payment wallet found.' };
    if (amount < expectedAmount) return { valid: false, reason: 'Amount too low.' };
    return { valid: true, payer, amount, mint };
  } catch (e) {
    return { valid: false, reason: 'Error verifying transaction.' };
  }
}

// --- Extract command logic to functions ---
async function handleAddWallet(chatId) {
  bot.sendMessage(chatId, 'Please send your Solana wallet address to add it.');
}

async function handleCheckWallet(chatId) {
  bot.sendMessage(chatId, 'Checking your wallet for airdrops and tokens...');
  // Add your wallet checking logic here
}

async function handleFarmairdrops(chatId) {
  reloadManualAirdrops();
  const loadingMsg = await bot.sendMessage(chatId, '🔍 *Scanning for airdrops...*\n\n' +
    '⏳ Please wait while I gather the latest opportunities...',
        { parse_mode: 'Markdown' }
      );
  try {
    const airdrops = Object.values(manualAirdrops);
    if (airdrops.length === 0) {
      return bot.editMessageText('❌ *No airdrops available at the moment.*\n\n' +
        'Check back later for new opportunities!',
        {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
          parse_mode: 'Markdown'
        }
      );
    }
    const keyboard = {
      inline_keyboard: [
        ...airdrops.map(airdrop => [{
          text: `🎯 ${airdrop.name}`,
          callback_data: `airdrop_${airdrop.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        }]),
        [
          { text: '🏠 Main Menu', callback_data: 'main_menu' }
        ]
      ]
    };
    const message = '🎯 *Available Airdrops*\n\n' +
      airdrops.map(airdrop => 
        `*${airdrop.name}*\n` +
        `${airdrop.description}\n` +
        `🔗 [Website](${airdrop.website}) | [Twitter](${airdrop.twitter}) | [Discord](${airdrop.discord})\n`
      ).join('\n') +
      '\n_Select an airdrop to view tasks and start farming!_';
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: loadingMsg.message_id,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: keyboard
    });
  } catch (e) {
    console.error('[ERROR] /farmairdrops:', e);
    bot.editMessageText('❌ *Error fetching airdrops*\n\n' +
      'Please try again later or contact support if the issue persists.',
      {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown'
      }
    );
  }
}

async function handleStake(chatId) {
  bot.sendMessage(chatId, 'Here are your staking options...');
  // Add your staking logic here
}

async function handleSwap(chatId) {
  bot.sendMessage(chatId, 'Here are your swap options...');
  // Add your swap logic here
}

async function handleStreak(chatId) {
  // Reuse your /streak command logic here
  if (!userStreaks[chatId] || Object.keys(userStreaks[chatId]).length === 0) {
    return bot.sendMessage(chatId, 
      '❌ *No activity streak data available*\n\n' +
      'Complete some tasks to start tracking your streaks!',
      { parse_mode: 'Markdown' }
    );
  }
  const streakInfo = Object.entries(userStreaks[chatId])
    .map(([airdropId, streak]) => {
      const airdrop = Object.values(manualAirdrops).find(a => 
        a.name.toLowerCase().replace(/[^a-z0-9]/g, '_') === airdropId
      );
      return airdrop ? 
        `*📌 ${airdrop.name}*\n` +
        `🔥 *Streak:* ${streak.streakDays} days\n` +
        `💫 *Transactions:* ${streak.txCount}\n` +
        `💰 *Volume:* $${streak.volume.toFixed(2)}\n` +
        `⏰ *Last activity:* ${new Date(streak.lastTx).toLocaleString()}\n` :
        '';
    })
    .filter(Boolean)
    .join('\n');
  bot.sendMessage(chatId, 
    '📊 *Your Activity Streaks*\n\n' + streakInfo + '\n\n' +
    '_Keep up the good work! Your activity helps increase your chances of receiving airdrops._',
    { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    }
  );
}

// Update handleUpgrade to accept a transaction hash and verify payment
async function handleUpgrade(chatId) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '💎 Upgrade to Premium', callback_data: 'upgrade_premium' }]
    ]
  };
  bot.sendMessage(chatId, '💎 Premium Features:\n\n' +
    '• Unlimited wallet checks\n' +
    '• Priority airdrop alerts\n' +
    '• Advanced analytics\n' +
    '• Early access to new features\n\n' +
    'To upgrade, send $5 USDC or USDT to this wallet:\n' +
    '`' + PAYMENT_WALLET + '`\n\n' +
    'After payment, reply with your transaction hash (signature) to activate premium.\n',
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
  // Listen for the next message from this user for a transaction hash
  userStatus[chatId] = { state: 'awaiting_payment_hash' };
}

// --- Update command handlers to use these functions ---
bot.onText(/\/addwallet/, async (msg) => { await handleAddWallet(msg.chat.id); });
bot.onText(/\/checkwallet/, async (msg) => { await handleCheckWallet(msg.chat.id); });
bot.onText(/\/farmairdrops/, async (msg) => { await handleFarmairdrops(msg.chat.id); });
bot.onText(/\/stake/, async (msg) => { await handleStake(msg.chat.id); });
bot.onText(/\/swap/, async (msg) => { await handleSwap(msg.chat.id); });
bot.onText(/\/streak/, async (msg) => { await handleStreak(msg.chat.id); });
bot.onText(/\/upgrade/, async (msg) => { await handleUpgrade(msg.chat.id); });

// --- Update callback_query handler for main menu buttons ---
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  if (data === 'addwallet') {
    await handleAddWallet(chatId);
    return bot.answerCallbackQuery(query.id);
  }
  if (data === 'checkwallet') {
    await handleCheckWallet(chatId);
    return bot.answerCallbackQuery(query.id);
  }
  if (data === 'farmairdrops') {
    await handleFarmairdrops(chatId);
    return bot.answerCallbackQuery(query.id);
  }
  if (data === 'stake') {
    await handleStake(chatId);
    return bot.answerCallbackQuery(query.id);
  }
  if (data === 'swap') {
    await handleSwap(chatId);
    return bot.answerCallbackQuery(query.id);
  }
  if (data === 'streak') {
    await handleStreak(chatId);
    return bot.answerCallbackQuery(query.id);
  }
  if (data === 'upgrade') {
    await handleUpgrade(chatId);
    return bot.answerCallbackQuery(query.id);
  }
  if (data === 'main_menu') {
    // Show the /start menu
    const msg = { chat: { id: chatId } };
    await bot.onText(/\/start/, msg); // or call your start handler directly
    return bot.answerCallbackQuery(query.id);
  }
  if (data === 'back_to_airdrops') {
    await handleFarmairdrops(chatId, query.message.message_id);
    return bot.answerCallbackQuery(query.id);
  }
  // ... rest of existing callback_query handler ...
});

// Update fallback/message handler to process payment hash
bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }
  if (msg.data) return;
  const chatId = msg.chat.id;
  const userState = userStatus[chatId];
  if (userState && userState.state === 'awaiting_payment_hash') {
    const signature = msg.text.trim();
    bot.sendMessage(chatId, '⏳ Verifying your payment...');
    const result = await verifyPaymentTx(signature, PAYMENT_WALLET, PREMIUM_PRICE);
    if (result.valid) {
      // Mark user as premium (implement your own logic here)
      userStatus[chatId].premium = true;
      userStatus[chatId].state = undefined;
      bot.sendMessage(chatId, `✅ Payment confirmed!\nYou are now a premium user.\n\n• Paid: $${result.amount} ${(result.mint === USDC_MINT ? 'USDC' : 'USDT')}`);
    } else {
      bot.sendMessage(chatId, `❌ Payment failed: ${result.reason}`);
    }
    return;
  }
  if (userState && userState.state === 'awaiting_airdrop_input') {
    // ... airdrop input logic ...
    return;
  } else if (userState && userState.state === 'awaiting_airdrop_edit') {
    // ... airdrop edit logic ...
    return;
  }
  // Fallback for unrecognized plain text (only if not handled above)
  if (msg.text) {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '➕ Add Wallet', callback_data: 'addwallet' },
          { text: '👛 Check Wallet', callback_data: 'checkwallet' }
        ],
        [
          { text: '🎯 Farm Airdrops', callback_data: 'farmairdrops' },
          { text: '💎 Stake', callback_data: 'stake' }
        ],
        [
          { text: '🔄 Swap', callback_data: 'swap' },
          { text: '📊 Streak', callback_data: 'streak' }
        ],
        [{ text: '⭐️ Upgrade to Premium', callback_data: 'upgrade' }]
      ]
    };
    bot.sendMessage(chatId, 'Sorry, I didn\'t understand that. Type /help to see what I can do, or choose an option below.', { reply_markup: keyboard });
  }
});

// Farm airdrops command handler
bot.onText(/\/farmairdrops/, async (msg) => {
  await handleFarmairdrops(msg.chat.id);
});

// Start command handler (the ONLY /start handler)
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    inline_keyboard: [
      [
        { text: '➕ Add Wallet', callback_data: 'addwallet' },
        { text: '👛 Check Wallet', callback_data: 'checkwallet' }
      ],
      [
        { text: '🎯 Farm Airdrops', callback_data: 'farmairdrops' },
        { text: '💎 Stake', callback_data: 'stake' }
      ],
      [
        { text: '🔄 Swap', callback_data: 'swap' },
        { text: '📊 Streak', callback_data: 'streak' }
      ],
      [{ text: '⭐️ Upgrade to Premium', callback_data: 'upgrade' }]
    ]
  };

  const welcomeMessage =
    '🌟 *Welcome to Solsweepr!*\n\n' +
    'Your all-in-one Telegram bot for discovering, tracking, and farming the best Solana airdrops and DeFi opportunities.\n\n' +
    'Here\'s what you can do:\n\n' +
    '➕ *Add Wallet* — Track your Solana wallets\n' +
    '👛 *Check Wallet* — See balances, tokens, and airdrop eligibility\n' +
    '🎯 *Farm Airdrops* — View and complete tasks for upcoming airdrops\n' +
    '💎 *Stake* — Explore staking options for your SOL\n' +
    '🔄 *Swap* — Find the best swap routes\n' +
    '📊 *Streak* — Track your wallet activity streaks\n' +
    '⭐️ *Upgrade* — Unlock premium features\n\n' +
    '*Available Commands:*\n' +
    '`/addwallet`  `/checkwallet`  `/farmairdrops`  `/stake`  `/swap`  `/streak`  `/upgrade`  `/help`\n\n' +
    '_Tap a button below or use a command to get started!_';

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    disable_web_page_preview: true
  });
});

// Help command handler
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    inline_keyboard: [
      [
        { text: '➕ Add Wallet', callback_data: 'addwallet' },
        { text: '👛 Check Wallet', callback_data: 'checkwallet' }
      ],
      [
        { text: '🎯 Farm Airdrops', callback_data: 'farmairdrops' },
        { text: '💎 Stake', callback_data: 'stake' }
      ],
      [
        { text: '🔄 Swap', callback_data: 'swap' },
        { text: '📊 Streak', callback_data: 'streak' }
      ],
      [{ text: '⭐️ Upgrade to Premium', callback_data: 'upgrade' }]
    ]
  };

  const helpMessage = 
    '📚 *Solsweepr Bot Help*\n\n' +
    '*Available Commands:*\n\n' +
    '`/start` - Start the bot and show main menu\n' +
    '`/help` - Show this help message\n' +
    '`/addwallet` - Add a new Solana wallet\n' +
    '`/checkwallet` - Check wallet balances and tokens\n' +
    '`/farmairdrops` - View available airdrops\n' +
    '`/stake` - Access staking options\n' +
    '`/swap` - View swap opportunities\n' +
    '`/streak` - Check your activity streak\n' +
    '`/upgrade` - Upgrade to premium features\n\n' +
    '_Select an option below to get started!_';

  bot.sendMessage(chatId, helpMessage, { 
    parse_mode: 'Markdown',
    reply_markup: keyboard,
    disable_web_page_preview: true
  });
});