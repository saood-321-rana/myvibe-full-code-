const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { addMusic, getAllMusic, deleteMusic, updateMusic } = require('../controllers/musicController');
const auth = require('../middleware/auth'); // Assuming you're using auth middleware

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Initialize upload
const upload = multer({ storage });

// @route   POST api/music
// @desc    Add new music
// @access  Private
router.post('/', auth, upload.single('songFile'), addMusic);

// @route   GET api/music
// @desc    Get all music
// @access  Private
router.get('/', auth, getAllMusic);

// @route   DELETE api/music/:id
// @desc    Delete a music entry
// @access  Private
router.delete('/:id', auth, deleteMusic);

// @route   PUT api/music/:id
// @desc    Update a music entry
// @access  Private
router.put('/:id', auth, updateMusic);

module.exports = router;
