
const mongoose = require('mongoose');

const invitationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Organization',
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'mentor'],
  },
  // Optional: You might want codes to expire
  // expiresAt: {
  //   type: Date,
  // },
}, {
  timestamps: true,
});

module.exports = mongoose.model('InvitationCode', invitationCodeSchema);
