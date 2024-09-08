# ZKFeedback

ZKFeedback is a decentralized feedback system leveraging zero-knowledge proofs to ensure user privacy while providing transparent and public feedback. This project utilizes zkverifier for generating zero-knowledge proofs and Cost-effective Proof Verification where the user's wallet remains private, dbforest SQL for  storage feedback, and ORA Ai for sentiment analysis through smart contracts. Also used ENS for name resolution.

## contract 

https://sepolia.etherscan.io/address/0xa5a0A35F52541B8AF3e31F24Fa5Da28fb74b456A - solidity Verifier

## Features

- **Privacy-Preserving Feedback**: Users' wallet addresses are kept confidential using zero-knowledge proofs.
- **Public Feedback**: Feedback remains publicly accessible, ensuring transparency.
- **Sentiment Analysis**: Integrated with ORA Ai to analyze feedback sentiment through smart contracts.
- **Efficient Storage**: Utilizes dbforest SQL database for robust and scalable feedback storage.
- **ENS**: Resolving address to ens.

## Getting Started

### Prerequisites

- Node.js and npm
- MySQL or compatible SQL database (dbforest)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/mxber2022/ETHWarsaw
    ```

2. Navigate to the project directory:

    ```bash
    cd ETHWarsaw
    cd zksnark
    ```

3. Install dependencies:

    ```bash
    npm run dev
    ```

## Usage

- **Submitting Feedback**: Use the frontend interface to submit feedback. Your wallet address will remain private, and feedback will be stored and processed.
- **Viewing Feedback**: Access the public feedback through the provided interface or API.
- **Sentiment Analysis**: The system will automatically analyze feedback sentiment using ORA Ai and present the results.

## Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request with a clear description of the changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [zkverifier](https://github.com/your-username/zkverifier) for zero-knowledge proof generation
- [dbforest SQL](https://dbforest.io) for database management
- [ORA Ai](https://ora.ai) for sentiment analysis

For more details, please refer to the [documentation](docs/README.md) or contact the project maintainers.

---

Feel free to adjust the content as needed!