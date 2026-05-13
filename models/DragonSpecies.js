const mongoose = require('mongoose');

const dragonSpeciesSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'legendary', 'mythic'], required: true },
  type: [String],
  baseStats: {
    hp: Number,
    attack: Number,
    defense: Number,
    spAtk: Number,
    spDef: Number,
    speed: Number
  },
  catchRate: { type: Number, min: 0, max: 255 },
  description: String,
  imageUrl: String,
  abilities: [String],
  evolutions: [{
    evolvesInto: Number,
    requirement: String,
    level: Number
  }],
  moves: [String],
  spawnRates: {
    forest: Number,
    mountain: Number,
    water: Number,
    sky: Number,
    cave: Number,
    urban: Number
  }
});

module.exports = mongoose.model('DragonSpecies', dragonSpeciesSchema);
