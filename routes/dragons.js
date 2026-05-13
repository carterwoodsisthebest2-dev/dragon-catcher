const express = require('express');
const Dragon = require('../models/Dragon');
const DragonSpecies = require('../models/DragonSpecies');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/species', async (req, res) => {
  try {
    const species = await DragonSpecies.find();
    res.json(species);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/species/:id', async (req, res) => {
  try {
    const species = await DragonSpecies.findOne({ id: req.params.id });
    res.json(species);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/catch', authenticateToken, async (req, res) => {
  try {
    const { speciesId } = req.body;
    const species = await DragonSpecies.findOne({ id: speciesId });
    
    if (!species) return res.status(404).json({ message: 'Dragon species not found' });
    
    // Calculate catch success
    const catchChance = (species.catchRate / 255) * 100;
    const success = Math.random() * 100 < catchChance;
    
    if (!success) {
      return res.json({ success: false, message: 'Dragon escaped!' });
    }
    
    // Create new dragon instance
    const dragon = new Dragon({
      owner: req.userId,
      speciesId: species.id,
      level: Math.floor(Math.random() * 5) + 1,
      isCaught: true
    });
    
    // Set base stats
    dragon.health = species.baseStats.hp + dragon.level;
    dragon.attack = species.baseStats.attack + dragon.level;
    dragon.defense = species.baseStats.defense + dragon.level;
    dragon.spAttack = species.baseStats.spAtk + dragon.level;
    dragon.spDefense = species.baseStats.spDef + dragon.level;
    dragon.speed = species.baseStats.speed + dragon.level;
    dragon.ability = species.abilities[Math.floor(Math.random() * species.abilities.length)];
    dragon.gender = ['male', 'female'][Math.floor(Math.random() * 2)];
    dragon.moves = species.moves.slice(0, 4);
    
    await dragon.save();
    await User.findByIdAndUpdate(req.userId, { $push: { capturedDragons: dragon._id } });
    
    res.json({ success: true, dragon, message: 'Dragon caught!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/evolve/:dragonId', authenticateToken, async (req, res) => {
  try {
    const dragon = await Dragon.findById(req.params.dragonId);
    if (!dragon) return res.status(404).json({ message: 'Dragon not found' });
    
    const species = await DragonSpecies.findOne({ id: dragon.speciesId });
    if (!species.evolutions.length) return res.status(400).json({ message: 'Dragon cannot evolve' });
    
    const evolution = species.evolutions[dragon.evolution.currentForm];
    if (!evolution || dragon.level < evolution.level) {
      return res.status(400).json({ message: 'Cannot evolve yet' });
    }
    
    dragon.speciesId = evolution.evolvesInto;
    dragon.evolution.currentForm += 1;
    await dragon.save();
    
    res.json({ success: true, dragon, message: 'Dragon evolved!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
