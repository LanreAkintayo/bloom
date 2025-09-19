export type Token = {
  name: string;
  symbol: string;
  decimal: number;
  image: string;
  balance: bigint;
  address: string;
};

export type WalletToken = Token & {
  // chainId: number;
};
