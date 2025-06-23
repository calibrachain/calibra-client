export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateTransactionHash = (): string => {
  return `0x${generateRandomString(64).toLowerCase()}`;
};

export const simulateChainlinkLogs = [
  '🔗 Initializing Chainlink Functions...',
  '📡 Connecting to Chainlink network nodes...',
  '🔍 Verifying laboratory credentials...',
  '📋 Validating certificate data...',
  '🏭 Querying accredited laboratories database...',
  '✅ Laboratory verified successfully!',
  '🔐 Generating verification hash...',
  '📝 Creating audit record...',
  '🌐 Sending data to blockchain...',
  '✨ Digital certificate created successfully!'
];