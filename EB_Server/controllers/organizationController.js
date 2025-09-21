
const Organization = require('../models/organizationModel');
const InvitationCode = require('../models/invitationCodeModel');
const User = require('../models/userModel');

// Helper function to generate a random 4-digit code
const generateRandomCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * @desc    Create a new organization
 * @route   POST /api/organizations
 * @access  Private (Admin only)
 */
const createOrganization = async (req, res) => {
  const { name } = req.body;
  const adminId = req.user.id; // From auth middleware

  if (!name) {
    return res.status(400).json({ message: 'Please provide an organization name' });
  }

  try {
    // Check if the admin is already part of an organization
    const adminUser = await User.findById(adminId);
    if (adminUser.organization) {
      return res.status(400).json({ message: 'Admin already belongs to an organization' });
    }

    // Create the organization
    const organization = await Organization.create({
      name,
      admin: adminId,
    });

    // Update the admin user to link them to this new organization
    adminUser.organization = organization._id;
    await adminUser.save();

    res.status(201).json(organization);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) { // Handle duplicate organization name
        return res.status(400).json({ message: 'An organization with this name already exists.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Generate an invitation code for the organization
 * @route   POST /api/organizations/generate-code
 * @access  Private (Admin only)
 */
const generateInvitationCode = async (req, res) => {
  const { role } = req.body; // 'student' or 'mentor'
  const adminId = req.user.id;

  if (!role || !['student', 'mentor'].includes(role)) {
    return res.status(400).json({ message: 'Please provide a valid role (student or mentor)' });
  }

  try {
    const adminUser = await User.findById(adminId);
    const organizationId = adminUser.organization;

    if (!organizationId) {
        return res.status(400).json({ message: 'Admin must create an organization first.' });
    }

    // Generate a unique code
    let newCode;
    let codeExists = true;
    while (codeExists) {
      newCode = generateRandomCode();
      codeExists = await InvitationCode.findOne({ code: newCode });
    }

    const invitation = await InvitationCode.create({
      code: newCode,
      organization: organizationId,
      role,
    });

    res.status(201).json(invitation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createOrganization,
  generateInvitationCode,
};
