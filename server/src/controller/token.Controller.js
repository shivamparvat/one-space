// token.Controller.ts
import AppToken from '../Schema/apptoken.js'; // Adjust the path as necessary

// Function to store the token
export const connect = async (req, res) => {
    try {
        const {state, token, scope} = req.body;

        if (!state || !token) {
            res.status(400).json({error: 'State and token are required.'});
            return
        }

        const newAuth = new AppToken({state, token, scope});
        await newAuth.save();

        res.status(201).json({message: 'Data saved successfully', data: newAuth});
    } catch (error) {
        res.status(500).json({error: 'Failed to save data', details: error.message});
    }
};

// Function to disconnect and delete the token
export const disconnect = async (req, res) => {
    try {
        const {id} = req.params; // Get the id from the request parameters

        // Validate input
        if (!id) {
            res.status(400).json({error: 'ID is required.'});
            return
        }

        // Delete the token based on the provided id
        const deletedAuth = await AppToken.findByIdAndDelete(id);

        if (!deletedAuth) {
            res.status(404).json({error: 'Token not found.'})
            return
        }

        res.status(200).json({message: 'Token disconnected successfully', data: deletedAuth});
    } catch (error) {
        res.status(500).json({error: 'Failed to disconnect token', details: error.message});
    }
};

// Function to list all stored tokens
export const listTokens = async (req, res) => {
    try {
        // Retrieve all tokens from the database
        const tokens = await AppToken.find();

        res.status(200).json({message: 'Tokens retrieved successfully', data: tokens});
    } catch (error) {
        res.status(500).json({error: 'Failed to retrieve tokens', details: error.message});
    }
};
