const mongoose = require('mongoose');

const dragonSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  speciesId: { type: Number, required: true },
  nickname: String,
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  health: Number,
  attack: Number,
  defense: Number,
  spAttack: Number,
  spDefense: Number,
  speed: Number,
  nature: String,
  ability: String,
  moves: [String],
  gender: { type: String, enum: ['male', 'female', 'genderless'] },
  isCaught: { type: Boolean, default: false },
  isTeamMember: { type: Boolean, default: false },
  evolution: {
    currentForm: { type: Number, default: 0 },
    canEvolve: Boolean,
    evolvesAt: Number
  },
  caughtAt: { type: Date, default: Date.now },
  happiness: { type: Number, default: 0 }
});

module.exports = mongoose.model('Dragon', dragonSchema);
