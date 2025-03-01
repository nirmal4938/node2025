const mongoose = require('mongoose');

const getOrCreateTransaction = async (transactionCallback) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Execute the callback with the session
        await transactionCallback(session);

        // Commit the transaction
        await session.commitTransaction();
        console.log('Transaction committed successfully.');
    } catch (error) {
        // Abort the transaction in case of an error
        console.error('Error during transaction. Rolling back changes:', error);
        await session.abortTransaction();
        throw error; // Rethrow the error to allow upstream handling
    } finally {
        // End the session
        session.endSession();
        console.log('Session ended.');
    }
};

module.exports = { getOrCreateTransaction };
