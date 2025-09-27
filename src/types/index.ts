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

// Define enum
export enum Status {
  Pending, // 0
  Acknowledged, // 1
  Completed, // 2
  Disputed, // 3
  Resolved, // 4
  Reversed, // 5
  Canceled,
}

export type DealAction =
  | "cancel"
  | "release"
  | "acknowledge"
  | "unacknowledge"
  | "dispute"
  | null;

export type TypeChainId = 11155111;

export type Juror = {
  jurorAddress: string;
  stakeAmount: bigint;
  reputation: bigint;
  score: bigint;
  missedVotesCount: bigint;
  lastWithdrawn: bigint;
};
