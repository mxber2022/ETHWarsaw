"use client"
import { useSDK } from "@metamask/sdk-react";
import React, { useState } from "react";

export const METAMASK = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { sdk, connected, connecting, provider, chainId } = useSDK(); // MetaMask SDK Hook

  const connect = async () => {
    setLoading(true);
    console.log('Connecting to MetaMask...');
    try {
      const accounts = await sdk?.connect(); // Connect to MetaMask
      console.log('Connected Accounts:', accounts);
      //@ts-ignore
      setAccount(accounts?.[0] || null);
    } catch (err) {
      console.warn('Failed to connect:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="c">
    <button className="cbtm" onClick={connect} disabled={connecting || loading}>
      {account ? "Connected" : "Connect Metamask"}
    </button>
  
</div>

  );
};
