// pragma circom 2.0.0;

// template sudoku() {
//     signal input userPublicKey; 
//     signal input feedbackHash;  
//     signal input nullifier;  

//     signal output feedbackIsValid;
//     signal output nullifierOutput;

//     feedbackIsValid <-- (feedbackHash != 0);
//     nullifierOutput <== nullifier;
// }

// component main = sudoku();

pragma circom 2.0.0;

template sudoku(n) {
    signal input a;
    signal input b;
    signal output c;

    signal int[n];

    int[0] <== a*a + b;
    for (var i=1; i<n; i++) {
    int[i] <== int[i-1]*int[i-1] + b;
    }

    c <== int[n-1];
}

component main = sudoku(1000);
