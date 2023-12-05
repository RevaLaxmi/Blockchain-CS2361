'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

let requesterId, patientId, transactionPassword;
process.argv.forEach(function (val, index, array) {
    if (index === 2) requesterId = val;
    if (index === 3) patientId = val;
    if (index === 4) transactionPassword = val; // Assuming the transaction password is passed as the fourth argument
});

async function main() {
    try {
        // Load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user
        const identity = await wallet.get(requesterId);
        if (!identity) {
            console.log(`An identity for the user ${requesterId} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: requesterId, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network
        const contract = network.getContract('PatientRecordManagement');

        // Evaluate the specified transaction to query patient data
        const result = await contract.evaluateTransaction('accessPatientRecord', patientId, transactionPassword);
        console.log(`Query result: ${result.toString()}`);

        // Disconnect from the gateway
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
