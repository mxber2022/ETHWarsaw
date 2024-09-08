"use client"
import { useSDK } from "@metamask/sdk-react";
import React, { useState, useEffect } from "react";
import { AvatarResolver, utils as avtUtils } from '@ensdomains/ens-avatar';
import { ethers } from "ethers";

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

  const [avaURI, setAvaURI] = useState("")
  const [image, setImage] = useState("");
  const [nameResolved, setNameResolved] = useState("");

  async function resolveNames(name: any) {
    console.log("name:",name);
    if(name) {
    setAvaURI("")
    const tempProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/e96abcff2f494bcd81fadc53c8fd6ac9");
    const lastFourDigits = name.substring(name.length - 4);

    if(lastFourDigits === ".eth") 
    {
      setAvaURI("");
      var address =  await tempProvider.resolveName(name);
      console.log("resolveNames: ", address);
      //@ts-ignore
      setNameResolved(address);
    }
    else {
      try
      {
        console.log("else:");
        setAvaURI("");
        //@ts-ignore
        setNameResolved("");
        console.log(tempProvider);
        const resolvedAddress = await tempProvider.lookupAddress(name);
        console.log("resolvedAddress: ", resolvedAddress);
        //@ts-ignore
        setNameResolved(resolvedAddress);

        /* 
          Resolve Avatar
        */
       //@ts-ignore
        const avt = new AvatarResolver(tempProvider);
        //@ts-ignore
        const avatarURI = await avt.getAvatar(resolvedAddress);
        console.log("AVA URI: ", avatarURI);
        //@ts-ignore
        setAvaURI(avatarURI);
      }
      catch(e) {
        
      }
        
    }
  }
        
  }
  if(nameResolved==null){
    setNameResolved(account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : "")
  }

  useEffect(()=>{

    try{
      resolveNames(account);
    } 
    catch(e) {
      console.log("cannot resolve name");
    }

  },[account] )

  return (
    <div className="c">
    <button className="cbtm" onClick={connect} disabled={connecting || loading}>
      {account ? `Connected: ${nameResolved}` : "Connect Metamask"}
    </button>
  
</div>

  );
};
