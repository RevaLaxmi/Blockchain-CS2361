'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

//let choice, patientData, patientName, password;
//process.argv.forEach(function (val, index, array) {
//    choice = array[2];
//    switch (choice) {
//        case 'registerPatient':
//            patientName = array[3];
//            patientData = array[4];
//            password = array[5];
//            break;
//        case 'accessPatientRecord':
//            patientName = array[3];
//            password = array[4];
//            break;
//    }
//});

async function main() {
    let choice = process.argv[2];
    let patientName = process.argv[3]; // Move this line here
    let patientData = process.argv[4]; // This line as well
    let password = process.argv[5];    // And this one
    
    try {

        // Wallet and gateway setup
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Checking if identity exists in the wallet
        const identityExists = await wallet.get(patientName);
        if (!identityExists) {
            console.error(`An identity for the name "${patientName}" does not exist in the wallet`);
            return;
        }

        // Load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        
        // Create a new gateway for connecting to the peer node
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: patientName, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) and contract
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabchat');

        // Invoke chaincode functions based on the provided choice
        switch (choice) {
            case 'registerPatient':
                const patientName = process.argv[3];
                const patientData = process.argv[4];
                const password = process.argv[5];
                await contract.submitTransaction('registerPatient', patientName, patientData, password);
                console.log(`Patient registered: ${patientName}`);
                break;
            case 'accessPatientRecord':
                const patientNameForAccess = process.argv[3];
                const passwordForAccess = process.argv[4];
                const retrievedPatientData = await contract.evaluateTransaction('accessPatientRecord', patientNameForAccess, passwordForAccess);
                console.log(`Patient Data: ${retrievedPatientData.toString()}`);
                break;
        }

        // Disconnect from the gateway
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();