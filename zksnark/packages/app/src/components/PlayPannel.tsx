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
const snarkjs = require("snarkjs");

const PlayPannel: React.FC = () => {
  const [puzzle, setPuzzle] = useState<number[]>(Array(81).fill(0));
  const [solution, setSolution] = useState<number[]>(Array(81).fill(0));
  const [selectedCellIndex, setSelectedCellIndex] = useState<number>(-1);

  const [proof, setProof] = useState<string>('');
  const [proofCalculating, setProofCalculating] = useState<boolean>(false);

  const { proofGenerating, proof: sindriProof, error, generateProof } = useSindri();
  const [messageApi, contextHolder] = message.useMessage();

  const useSindriFlag = process.env.NEXT_PUBLIC_USE_SINDRI === 'true';
  const { selectedAccount } = useAccount();
  const { verifying, verified, error:x, onVerifyProof } = useZkVerify(selectedAccount);

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

  const onKeyButtonClick = (value: number) => {
    if (selectedCellIndex === -1) return;
    if (puzzle[selectedCellIndex] > 0) return;

    const newSolution = [...solution];
    newSolution[selectedCellIndex] = value;
    setSolution(newSolution);
  };

  const onCellClick = (index: number) => {
    setSelectedCellIndex(index);
  };

  const onNewPuzzle = () => {
    const newPuzzle = generatePuzzle();
    setPuzzle(newPuzzle);
    setSolution(Array(81).fill(0));
    setSelectedCellIndex(-1);
  };

  const onSolvePuzzle = () => {
    const solution = getSolutionOfPuzzle(puzzle);
    setSolution(solution);
  };

  const onEraseSolution = () => {
    setSolution(Array(81).fill(0));
    setSelectedCellIndex(-1);
  };

  const onSavePuzzle = () => {
    const puzzleData = JSON.stringify(puzzle);
    const blob = new Blob([puzzleData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'puzzle.json';
    link.href = url;
    link.click();
  };

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
      // const isSolutionComplete = solution.every(value => value !== 0);
      // if (!isSolutionComplete) {
      //   throw new Error("The puzzle solution is incomplete. Please solve the puzzle before generating a proof.");
      // }

      // const packedPuzzle = packDigits(puzzle);

      if (useSindriFlag) {
       // await generateProof(packedPuzzle, solution);
      } else {
        

        const input = {
         
          "a": 3, 
          "b": 11
        };
  
        console.log("hello");
        
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          {a: 3, b: 1},
          'sudoku.wasm',
          'sudoku_1.zkey'
        );
        console.log("hello", publicSignals[0]);

        const circuitOutputSignal = publicSignals[0];
        console.log("circuitOutputSignal", circuitOutputSignal);
        // if (circuitOutputSignal === '1') {
        //   setProof(JSON.stringify(proof));
        //   messageApi.success(
        //     'Proof generated using snarkjs. You can now show that you have solved this puzzle without sharing the solution.',
        //     5
        //   );
        // } else {
        //   throw new Error("Your solution isn't correct. Please solve the puzzle correctly!");
        // }

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

          const { proof: pf, publicSignals: ps } = await snarkjs.groth16.fullProve({a: 3, b: 1}, "sudoku.wasm", "sudoku_1.zkey");
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

  const onSaveProof = () => {
    if (proof === '') {
      messageApi.error('Please generate proof for your solution!');
      return;
    }

    const blob = new Blob([proof], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'proof.json';
    link.href = url;
    link.click();
  };

  const [feedback, setFeedback] = useState<string>('');
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
            <Col>
              {/* <Button type="primary" onClick={onSaveProof}>
                Save Proof
              </Button> */}
            </Col>
          </Row>
        </Card>
      </Spin>
    </>
  );
};

export default PlayPannel;
