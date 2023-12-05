'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

class fabchat extends Contract {

    async initLedger(ctx) {
        console.info('Initialized the ledger for the Patient Record System');
    }

    async registerPatient(ctx, patientName, patientData, password) {
        console.info('Registering a new patient');

        const patientRecord = {
            patientName,
            patientData,
            password
        };

        await ctx.stub.putState(patientName, Buffer.from(JSON.stringify(patientRecord)));
        console.log(`Patient registered: ${patientName}`);
    }

    async accessPatientRecord(ctx, patientName, providedPassword) {
        const patientRecordAsBytes = await ctx.stub.getState(patientName);
        if (!patientRecordAsBytes || patientRecordAsBytes.length === 0) {
            throw new Error(`Patient record for ${patientName} does not exist`);
        }
        const patientRecord = JSON.parse(patientRecordAsBytes.toString());

        if (patientRecord.password !== providedPassword) {
            throw new Error('Unauthorized access: Incorrect password.');
        }

        return patientRecord.patientData;
    }
}

module.exports = fabchat;
