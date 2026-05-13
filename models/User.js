const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  money: { type: Number, default: 1000 },
  position: {
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 }
  },
  capturedDragons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dragon' }],
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dragon' }],
  dexCompleted: { type: Number, default: 0 },
  totalDragonsDiscovered: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
