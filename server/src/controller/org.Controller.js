import Organization from '../Schema/organizationSchema.js';
import User from '../Schema/userSchema.js';

// Create a new organization
export const add = async (req, res) => {
  try {
    const user_id = req.user._id; // Extract user ID from request

    // Create the organization from the request body
    const organization = await Organization.create({...req.body, user_id});
    if (!organization) {
      return res.status(400).json({ message: 'Failed to create organization' }); // Changed to 400 for creation failure
    }

    // Extract the organization ID
    const orgId = organization._id; // The ID of the created organization

    // Update the user with the newly created organization ID
    const user = await User.findByIdAndUpdate(
      user_id,
      { organization: orgId }, // Link the organization to the user
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Organization added to user successfully',
      user,
    });
  } catch (error) {
    console.error('Error adding organization to user:', error);
    return res.status(500).json({
      message: 'Failed to add organization to user',
      error: error.message,
    });
  }
};

// Get all organizations
export const getAllOrgs = async (req, res) => {
  try {
    const orgs = await Organization.find();
    return res.status(200).json({ message: 'Organizations retrieved successfully', orgs });
  } catch (error) {
    console.error('Error retrieving organizations:', error);
    return res.status(500).json({ message: 'Failed to retrieve organizations', error: error.message });
  }
};

// Get a single organization by ID
export const getOrgById = async (req, res) => {
  try {
    const { id } = req.params;

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    return res.status(200).json({ message: 'Organization retrieved successfully', org });
  } catch (error) {
    console.error('Error retrieving organization:', error);
    return res.status(500).json({ message: 'Failed to retrieve organization', error: error.message });
  }
};

// Update an organization
export const updateOrg = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedOrg = await Organization.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    return res.status(200).json({ message: 'Organization updated successfully', org: updatedOrg });
  } catch (error) {
    console.error('Error updating organization:', error);
    return res.status(500).json({ message: 'Failed to update organization', error: error.message });
  }
};

// Delete an organization
export const deleteOrg = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrg = await Organization.findByIdAndDelete(id);
    if (!deletedOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    return res.status(200).json({ message: 'Organization deleted successfully', org: deletedOrg });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return res.status(500).json({ message: 'Failed to delete organization', error: error.message });
  }
};
