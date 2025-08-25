// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
// import web3AuthContextConfig from "@/app/web3AuthContext";

// interface Web3AuthState {
//   web3Auth: Web3Auth | null;
//   provider: any;
//   login: () => Promise<void>;
//   logout: () => Promise<void>;
//   userInfo: any | null;
//   isLoggedIn: boolean;
// }

// const Web3AuthContext = createContext<Web3AuthState | undefined>(undefined);

// export const Web3AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
//   const [provider, setProvider] = useState<any>(null);
//   const [userInfo, setUserInfo] = useState<any>(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const initWeb3Auth = async () => {
//       try {
//         const w3a = new Web3Auth(web3AuthContextConfig.web3AuthOptions as Web3AuthOptions);
//         setWeb3Auth(w3a);
//         await w3a.initModal();
//         if (w3a.provider) {
//           setProvider(w3a.provider);
//           setUserInfo(await w3a.getUserInfo());
//           setIsLoggedIn(true);
//         }
//       } catch (err) {
//         console.error("Web3Auth initialization error:", err);
//       }
//     };
//     initWeb3Auth();
//   }, []);

//   const login = async () => {
//     if (!web3Auth) return;
//     try {
//       const p = await web3Auth.connect();
//       setProvider(p);
//       setUserInfo(await web3Auth.getUserInfo());
//       setIsLoggedIn(true);
//     } catch (err) {
//       console.error("Login failed:", err);
//     }
//   };

//   const logout = async () => {
//     if (!web3Auth) return;
//     try {
//       await web3Auth.logout();
//       setProvider(null);
//       setUserInfo(null);
//       setIsLoggedIn(false);
//     } catch (err) {
//       console.error("Logout failed:", err);
//     }
//   };

//   return (
//     <Web3AuthContext.Provider value={{ web3Auth, provider, login, logout, userInfo, isLoggedIn }}>
//       {children}
//     </Web3AuthContext.Provider>
//   );
// };

// export const useWeb3Auth = () => {
//   const context = useContext(Web3AuthContext);
//   if (!context) throw new Error("useWeb3Auth must be used within Web3AuthProvider");
//   return context;
// };
