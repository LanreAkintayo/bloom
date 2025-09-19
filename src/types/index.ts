export type Token = {
  name: string;
  symbol: string;
  decimal: number;
  balance: bigint;
};

export type WalletToken = Token & {
    image: string;
    // chainId: number;
    address: string;
};
