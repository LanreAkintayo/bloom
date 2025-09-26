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
  Pending,       // 0
  Acknowledged,  // 1
  Completed,     // 2
  Disputed,      // 3
  Resolved,      // 4
  Reversed,      // 5
  Canceled 

}
