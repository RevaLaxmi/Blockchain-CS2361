/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

let ctx, name, age, contactInfo, gender, illness;
process.argv.forEach(function (val, index, array) {
    name = array[2];
    age = array[3];
    contactInfo = array[4];
    gender = array[5];
    illness = array[6];
    check= array[7];
});

//for now we assume that doctors cannot be patients

async function main() {
    try {

        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        if (check === 'patient') {
            // Logic to register a patient
            // For example, you might call a function to register a patient here
        } 
        else if (check === 'doctor') {
            // Logic to register a doctor
            // For example, you might call a function to register a doctor here
        } 
        else {
            throw new Error('Invalid entity type. Must be either "patient" or "doctor".');
        }

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(patientId);
        if (!identity) {
            console.log(`An identity for the user ${patientId} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: patientId, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabchat');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        // await contract.submitTransaction('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom');
        if (choice === 'createMsg') {
            await contract.submitTransaction('createMsg', msg, emailID, isAnonymous);
            console.log(`${choice} Transaction has been submitted`);
        } else if (choice === 'flagMsg') {
            await contract.submitTransaction('flagMsg', msg);
            console.log(`${choice} Transaction has been submitted`);
        } else {
            console.log(`${choice} is invalid!`);
        }
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();