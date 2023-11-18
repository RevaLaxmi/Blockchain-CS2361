'use strict';

const { Contract } = require('fabric-contract-api');

class PatientDoctorManagement extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger for Patient-Doctor Management System ===========');
    
        console.info('Patient-Doctor Management System is now initialized.');
        console.info('Doctors and patients can register and utilize the system for healthcare management.');
        console.info('Patients can securely log in, view, and update their personal health records.');
        console.info('Doctors, upon verification, can access and update patient records.');
        console.info('All data is securely stored and managed on the blockchain, ensuring privacy and integrity.');
    
        console.info('============= END : Initialize Ledger for Patient-Doctor Management System ===========');
    }    

    // Function to register a patient with a unique odd ID
    async registerPatient(ctx, name, age, contactInfo, gender, illness) {
        const symmetricKey = crypto.randomBytes(32).toString('hex'); // 256-bit key
        let patientId = await this.generateUniqueOddId(ctx, 'patient');

        const patient = {
            docType: 'patient',
            Name: name,
            Age: age,
            ContactInfo: contactInfo,
            Gender: gender,
            SpecificIllness: illness,
            SymmetricKey: symmetricKey // kill me kill me what the fuck, but anyway ok so this is only for demonstration.. i cant actually just PRESENT the key 
        };

        await ctx.stub.putState(patientId.toString(), Buffer.from(JSON.stringify(patient)));
    }

    // Helper function to generate a unique odd ID
    async generateUniqueOddId(ctx, docType) {
        let id;
        let exists;
        do {
            id = this.makeOdd(Math.floor(Math.random() * 1000000));
            exists = await this.idExists(ctx, id, docType);
        } while (exists);
        return id;
    }

    // Helper function to ensure the ID is odd
    makeOdd(id) {
        return id % 2 === 0 ? id + 1 : id;
    }


    // Function to register a doctor with a unique even ID
    async registerDoctor(ctx, name, specialization, contactInfo) {
        let doctorId = await this.generateUniqueEvenId(ctx, 'doctor');

        const doctor = {
            docType: 'doctor',
            Name: name,
            ContactInfo: contactInfo
        };

        await ctx.stub.putState(doctorId.toString(), Buffer.from(JSON.stringify(doctor)));
        console.info(`Doctor ${doctorId} registered successfully.`);

        return doctorId.toString();
    }

    // Helper function to generate a unique even ID
    async generateUniqueEvenId(ctx, docType) {
        let id;
        let exists;
        do {
            id = this.makeEven(Math.floor(Math.random() * 1000000));
            exists = await this.idExists(ctx, id, docType);
        } while (exists);
        return id;
    }

    // Helper function to ensure the ID is even
    makeEven(id) {
        return id % 2 !== 0 ? id + 1 : id;
    }

    // Helper function to check if an ID already exists
    async idExists(ctx, id, docType) {
        const asBytes = await ctx.stub.getState(id.toString());
        if (!asBytes || asBytes.length === 0) {
            return false;
        }
        const record = JSON.parse(asBytes.toString());
        return record.docType === docType;
    }


    // Function to retrieve patient data based on requesterId
    async getPatientDataBasedOnRequester(ctx, patientId, requesterId) {
        // Check if the patient exists
        const patientAsBytes = await ctx.stub.getState(patientId);
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`Patient with ID ${patientId} does not exist`);
        }
        const patient = JSON.parse(patientAsBytes.toString());

        // Check if the requester is a registered doctor or the patient themselves
        const requesterAsBytes = await ctx.stub.getState(requesterId);
        if (!requesterAsBytes || requesterAsBytes.length === 0) {
            throw new Error(`Requester with ID ${requesterId} does not exist`);
        }
        const requester = JSON.parse(requesterAsBytes.toString());

        // If requester is the patient, return their data
        if (requesterId === patientId) {
            return patient;
        }

        // If requester is a doctor, check if they are the patient's doctor
        if (requester.docType === 'doctor' && patient.DoctorsName === requester.Name) {
            return patient;
        }

        throw new Error('Unauthorized access: You do not have permission to access this data.');
    }


        // Function to encrypt patient data
    async encryptPatientData(ctx, patientId, data) {
        const patientAsBytes = await ctx.stub.getState(patientId);
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`Patient with ID ${patientId} does not exist`);
        }

        const patient = JSON.parse(patientAsBytes.toString());
        const key = Buffer.from(patient.SymmetricKey, 'hex');
        const iv = crypto.randomBytes(16); // Initialization vector

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Storing encrypted data and IV
        patient.encryptedData = encrypted;
        patient.iv = iv.toString('hex');
        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));

        return { success: true, message: 'Patient data encrypted successfully' };
    }

    // Function to decrypt patient data
    async decryptPatientData(ctx, patientId) {
        const patientAsBytes = await ctx.stub.getState(patientId);
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`Patient with ID ${patientId} does not exist`);
        }

        const patient = JSON.parse(patientAsBytes.toString());
        const key = Buffer.from(patient.SymmetricKey, 'hex');
        const iv = Buffer.from(patient.iv, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(patient.encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    }


}

module.exports = PatientDoctorManagement;


/*
what the fuck cases:

if a doctor is a patient
if patient asks for patient record -> 

*/
