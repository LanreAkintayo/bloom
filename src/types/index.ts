export type Token = {
  name: string;
  symbol: string;
  decimal: number;
  image: string;
  address: string;
};

export type WalletToken = Token & {
  // chainId: number;
  balance: bigint;

};
