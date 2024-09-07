pragma circom 2.0.0;

template sudoku() {
    signal input userPublicKey; 
    signal input feedbackHash;  
    signal input nullifier;  

    signal output feedbackIsValid;
    signal output nullifierOutput;

    feedbackIsValid <-- (feedbackHash != 0);
    nullifierOutput <== nullifier;
}

component main = sudoku();
