import { Button, Card, Col, Row, Spin, Typography, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { generatePuzzle, getSolutionOfPuzzle, packDigits } from '../utils/GameUtils';
import KeyboardView from './KeyboardView';
import ProofView from './ProofView';
import PuzzleView from './PuzzleView';
import { useSindri } from '../hooks/useSindri';
import { VerifyTransactionInfo } from "zkverifyjs";
import { useZkVerify } from '../hooks/useZkVerify';
import { useAccount } from "../contexts/AccountContext";
import { SDKProvider, useSDK } from "@metamask/sdk-react";
import {ethers} from "ethers"
const snarkjs = require("snarkjs");

const PlayPannel: React.FC = () => {

  const [proof, setProof] = useState<string>('');
  const [proofCalculating, setProofCalculating] = useState<boolean>(false);

  const { proofGenerating, proof: sindriProof, error, generateProof } = useSindri();
  const [messageApi, contextHolder] = message.useMessage();

  const useSindriFlag = process.env.NEXT_PUBLIC_USE_SINDRI === 'true';
  const { selectedAccount } = useAccount();
  const { verifying, verified, error:x, onVerifyProof } = useZkVerify(selectedAccount);

  const { sdk, connected, connecting, provider, chainId, account } = useSDK(); 
  const [feedback, setFeedback] = useState<string>('');

  console.log("provider", provider);
  console.log("connected", connected);
  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (sindriProof) {
      setProof(sindriProof);
      messageApi.success(
        'Proof generated using Sindri. You can now show that you have solved this puzzle without sharing the solution.',
        5
      );
      setProofCalculating(false);
    }
  }, [sindriProof]);


  const downloadTransactionInfo = (transactionInfo: VerifyTransactionInfo) => {
    const blob = new Blob([JSON.stringify(transactionInfo, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `zkverify-${transactionInfo.attestationId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onGenerateProof = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProofCalculating(true);
    try {
      if (useSindriFlag) {
      
      } else 
      {
      console.log("b", feedback);
      console.log("account",account)

  
    
      // Use TextEncoder to get bytes from the string
      const encoder = new TextEncoder();
      const byteArray = encoder.encode(feedback);
      let hex='';
      // Convert each byte to its hexadecimal representation
      for (let i = 0; i < byteArray.length; i++) {
        hex += byteArray?.[i].toString(16).padStart(2, '0');
      }
    
      console.log("hex", hex);
      const feed_back = parseInt(hex, 16);
      const input = {
         
          "a": account, 
          "b": feed_back
        };
  
        console.log("hello");
        
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          input,
          'sudoku.wasm',
          'sudoku_1.zkey'
        );
        console.log("hello", publicSignals[0]);

        const circuitOutputSignal = publicSignals[0];
        console.log("circuitOutputSignal", circuitOutputSignal);

        console.log("proof", proof);
        setProof(JSON.stringify(proof));

        /*
          integrate
        */

          let vkey;
          if (useSindriFlag && proof) {
            console.log(vkey);
          } else {
            vkey = await fetch('sudoku_verify_key.json').then(res => res.json());
            console.log("v",vkey);
          }

          const { proof: pf, publicSignals: ps } = await snarkjs.groth16.fullProve(input, "sudoku.wasm", "sudoku_1.zkey");
          const res = await snarkjs.groth16.verify(vkey, ps, pf);
          console.log("res", res);

          const calldata = await snarkjs.groth16.exportSolidityCallData(pf,ps);
          console.log("calldata", calldata);

          const transactionInfo = await onVerifyProof(JSON.stringify(pf), ps, vkey);
          if (transactionInfo) {
            message.success(`Verified Successfully on zkVerify - AttestationId: ${transactionInfo.attestationId}`);
            //downloadTransactionInfo(transactionInfo);
            console.log("transactionInfo: ", transactionInfo)
          }
      
          /* Call your ethereum contract  */
          await test(transactionInfo?.attestationId, transactionInfo?.leafDigest, [], 1, 0);

      }
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "An unknown error occurred.",
        5
      );
    } finally {
      setProofCalculating(false);
    }
  };



  async function test(attestationId: any, leaf: any, merklePath: any, leafCount: any, index: any) {
 
    const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/kaFl069xyvy3np41aiUXwjULZrF67--t");
    console.log('Provider:', provider);

    const abi = [
        'function callVerifyProofAttestation(uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index) external returns (bool)'
    ];
    const contractAddress = '0x0Bb976ef70dAf0F9C7Aef7CA1A3F02b96881C23E';
    const contract = new ethers.Contract(contractAddress, abi, provider);

    try {
        // Populate the transaction data
        const txRequest = await contract.populateTransaction.callVerifyProofAttestation(
            attestationId,
            leaf,
            [],
            leafCount,
            index
        );

        // Use MetaMask provider to sign and send the transaction
        //@ts-ignore
        const metaMaskProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = metaMaskProvider.getSigner();
        console.log('Signer:', signer);

        // Send the transaction
        const txResponse = await signer.sendTransaction({
            to: contractAddress,
            data: txRequest.data,
            gasLimit: txRequest.gasLimit,
            gasPrice: txRequest.gasPrice
        });

        console.log('Transaction response:', txResponse);

        // Wait for transaction confirmation
        const receipt = await txResponse.wait();
        console.log('Transaction receipt:', receipt);

    } catch (error) {
        console.error('Error calling contract function:', error);
    }
}

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    
    setFeedback(event.target.value);
  };

  return (
    <>
      {contextHolder}
      <Row justify="center">
        <Col>
          <Typography.Title level={3}></Typography.Title>
        </Col>
      </Row>
      <Spin spinning={proofCalculating || proofGenerating} tip="Proof generating..." size="large">
        <Card title="Enter Feedback">
          <Row>
            {/* <Col span={20}>
              <PuzzleView
                puzzle={puzzle}
                solution={solution}
                selectedCellIndex={selectedCellIndex}
                onCellClick={onCellClick}
              />
            </Col>
            <Col span={4}>
              <KeyboardView onButtonClick={onKeyButtonClick} />
            </Col> */}

<form onSubmit={onGenerateProof} style={{ backgroundColor: '#141414', color: 'black', borderRadius: '8px' }}>
  <div>
    <textarea
      id="feedback"
      name="feedback"
      value={feedback}
      onChange={handleChange}
      rows={4}
      cols={50}
      placeholder="Type your feedback here..."
      required
      style={{ backgroundColor: '#141414', color: 'white', padding: '10px', borderRadius: '5px', border: '1px solid white' }}
    />
  </div>
  <button
    type="submit"
    style={{
      backgroundColor: 'white',
      color: '#141414',
      padding: '10px 20px',
      marginTop: '10px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    }}
  >
    Submit
  </button>
</form>

          </Row>
          {/* <Row gutter={20} justify="center" style={{ marginTop: 10 }}>
            <Col>
              <Button type="primary" onClick={onNewPuzzle}>
                New Puzzle
              </Button>
            </Col>
            <Col>
              <Button type="primary" onClick={onSolvePuzzle}>
                Solve Puzzle
              </Button>
            </Col>
            <Col>
              <Button type="primary" onClick={onEraseSolution}>
                Erase Solution
              </Button>
            </Col>
            <Col>
              <Button type="primary" onClick={onSavePuzzle}>
                Save Puzzle
              </Button>
            </Col>
          </Row> */}
        </Card>
        <Card title="Status" style={{ marginTop: 10 }}>
          <ProofView proof={proof} disabled={true} />
          <Row gutter={20} justify="center" style={{ marginTop: 10 }}>
            <Col>
              {/* <Button type="primary" onClick={onGenerateProof}>
                Generate Proof 
              </Button> */}
            </Col>
            {/* <Col>
              <Button type="primary" onClick={test}>
                Save Proof
              </Button>
            </Col> */}
          </Row>
        </Card>
      </Spin>
    </>
  );
};

export default PlayPannel;
