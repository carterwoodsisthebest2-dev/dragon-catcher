const express = require('express');
const User = require('../models/User');
const Dragon = require('../models/Dragon');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/player/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('capturedDragons').populate('team');
    if (!user) return res.status(404).json({ message: 'Player not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/player/move', authenticateToken, async (req, res) => {
  try {
    const { x, y } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { position: { x, y } }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/battle', authenticateToken, async (req, res) => {
  try {
    const { opponentId, playerTeam, opponentTeam } = req.body;
    
    // Simplified battle logic
    let playerHP = 0, opponentHP = 0;
    playerTeam.forEach(id => { playerHP += 100; });
    opponentTeam.forEach(id => { opponentHP += 100; });
    
    const playerWins = playerHP > opponentHP;
    const experience = playerWins ? 100 : 50;
    
    await User.findByIdAndUpdate(req.userId, { $inc: { experience, money: playerWins ? 500 : 250 } });
    
    res.json({ playerWins, experience });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/team/add', authenticateToken, async (req, res) => {
  try {
    const { dragonId } = req.body;
    const user = await User.findById(req.userId);
    
    if (user.team.length >= 6) {
      return res.status(400).json({ message: 'Team is full' });
    }
    
    user.team.push(dragonId);
    await user.save();
    
    await Dragon.findByIdAndUpdate(dragonId, { isTeamMember: true });
    
    res.json({ success: true, team: user.team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
