const mongoose = require('mongoose');
const PlaylistSong = require('../models/PlaylistSong'); // Adjust path as necessary
const Music = require('../models/Music'); // Adjust path as necessary
const Queue = require('../models/Queue'); // Adjust path as necessary
const SongSuggestion = require('../models/SongSuggestion');

// Fetch songs for a specific playlist
const getSongsByPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const currentUserId = req.user._id; // Assuming req.user contains the logged-in user info

    console.log('Fetching songs for playlistId:', playlistId);

    // Validate playlistId
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({ msg: 'Invalid playlist ID.' });
    }

    // Find all PlaylistSong entries for the given playlist
    const playlistSongs = await PlaylistSong.find({ 
      playlist: playlistId
    });

    console.log('PlaylistSongs found:', playlistSongs);

    if (!playlistSongs.length) {
      return res.status(404).json({ msg: 'No songs found for this playlist.' });
    }

    // Extract song IDs
    const songIds = playlistSongs.map(playlistSong => playlistSong.song);

    // Find songs in Music collection based on extracted song IDs
    const songs = await Music.find({ 
      _id: { $in: songIds }
    });

    if (!songs.length) {
      return res.status(404).json({ msg: 'No songs found for this playlist.' });
    }

    // Update the `userIds` array in each song document
    await Promise.all(songs.map(async (song) => {
      if (!song.userIds.includes(currentUserId)) {
        song.userIds.push(currentUserId);
        await song.save();
      }
    }));

    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs for playlist:', error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Fetch all songs of the currently logged-in user, sorted by artistName
const getAllSongsForUser = async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query string
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID.' });
    }

    console.log('Fetching all songs for user:', userId);

    // Find all songs for the user, sorted by artistName in ascending order
    const songs = await Music.find({ userIds: userId }).sort({ artistName: 1 });

    if (!songs.length) {
      return res.status(404).json({ msg: 'No songs found for this user.' });
    }

    res.json(songs);
  } catch (error) {
    console.error('Error fetching all songs for user:', error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Fetch all songs of a user without requiring authentication
const getAllSongsByUserNoAuth = async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query string

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID.' });
    }

    console.log('Fetching all songs for user without auth:', userId);

    // Find all songs for the user, sorted by artistName in ascending order
    const songs = await Music.find({ userIds: userId }).sort({ artistName: 1 });

    if (!songs.length) {
      return res.status(404).json({ msg: 'No songs found for this user.' });
    }

    res.json(songs);
  } catch (error) {
    console.error('Error fetching all songs for user without auth:', error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const addToQueue = async (req, res) => {
  try {
    const { songId, userId, status } = req.body; // Receive status from the frontend

    // Log the incoming request body for debugging
    console.log('Request body:', req.body);

    // Validate songId
    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ msg: 'Invalid song ID.' });
    }

    // Validate userId if provided
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID.' });
    }

    // Find the song in the Music collection
    const song = await Music.findById(songId);
    if (!song) {
      return res.status(404).json({ msg: 'Song not found.' });
    }

    // Check if the song is already in the queue for the same user
    const existingQueueEntry = await Queue.findOne({ songId: song._id, userId: userId });
    if (existingQueueEntry) {
      return res.status(400).json({ msg: 'Song is already in the queue.' });
    }

    // Create a new entry in the Queue collection with songId, userId, and status
    const newQueueEntry = new Queue({
      songId: song._id,
      userId: userId || null, 
      status: status // Use the status sent from the frontend
    });

    // Save the queue entry
    await newQueueEntry.save();

    res.status(201).json({ msg: 'Song added to queue successfully.' });
  } catch (error) {
    console.error('Error adding song to queue:', error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};


// Fetch all songs in the queue for a specific user with status 1
const getQueueSongsForUser = async (req, res) => {
  try {
    const { userId } = req.query; // Extract userId from query parameters

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID.' });
    }

    // Find all queue entries for the given userId and status 1
    const queueEntries = await Queue.find({ userId }).populate('songId');

    if (!queueEntries.length) {
      return res.status(404).json({ msg: 'No songs with status 1 found in the queue for this user.' });
    }

    // Extract songs from queue entries
    const songs = queueEntries.map(entry => entry.songId);

    res.json(songs);
  } catch (error) {
    console.error('Error fetching queue songs:', error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Fetch all songs in the queue for a specific user with status 1
const getQueueSongsRequests = async (req, res) => {
  try {
    const { userId } = req.query; // Extract userId from query parameters

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID.' });
    }

    // Find all queue entries for the given userId and status 1
    const queueEntries = await Queue.find({ userId, status: 0 }).populate('songId');

    if (!queueEntries.length) {
      return res.status(404).json({ msg: 'No songs with status 0 found in the queue for this user.' });
    }

    // Extract songs from queue entries
    const songs = queueEntries.map(entry => entry.songId);

    res.json(songs);
  } catch (error) {
    console.error('Error fetching queue songs:', error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Update song status from 0 to 1
const updateSongStatus = async (req, res) => {
  try {
    const { songId } = req.body; // Extract songId from the request body

    // Validate songId
    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ msg: 'Invalid song ID.' });
    }

    // Find the queue entry for the song and user
    const queueEntry = await Queue.findOne({ songId, status: 0 });

    if (!queueEntry) {
      return res.status(404).json({ msg: 'Queue entry not found or already updated.' });
    }

    // Update status to 1
    queueEntry.status = 1;
    await queueEntry.save();

    res.json({ msg: 'Song status updated to 1 successfully.' });
  } catch (error) {
    console.error('Error updating song status:', error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Delete a song from the queue collection
const deleteSongFromQueue = async (req, res) => {
  try {
    const { songId } = req.params; // Extract songId from URL parameters

    // Validate songId
    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ msg: 'Invalid song ID.' });
    }

    // Remove the song from the Queue collection
    const result = await Queue.deleteMany({ songId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: 'Song not found in the queue.' });
    }

    res.json({ msg: 'Song deleted from queue successfully.' });
  } catch (error) {
    console.error('Error deleting song from queue:', error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const suggestSong = async (req, res) => {
  try {
    const { songName } = req.body;
    const { userId } = req.params;

    if (!songName) {
      return res.status(400).json({ msg: 'Song title is required.' });
    }

    // Create new suggestion
    const newSuggestion = new SongSuggestion({
      songTitle: songName,
      userId,
    });

    await newSuggestion.save();

    res.status(201).json({ msg: 'Song suggested successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get All Suggested Songs for Logged-In User
// Get Suggested Songs for a Specific User
const getSuggestSongs = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the URL params
    const songSuggestions = await SongSuggestion.find({ userId });

    if (!songSuggestions.length) {
      return res.status(404).json({ msg: 'No song suggestions found for this user.' });
    }

    res.json(songSuggestions);
  } catch (error) {
    console.error('Error fetching song suggestions for user:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
};

const deleteSuggestedSong = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await SongSuggestion.findById(id);
    if (!song) {
      return res.status(404).json({ msg: 'Song not found' });
    }

    await SongSuggestion.findByIdAndDelete(id);  // Using findByIdAndDelete

    res.json({ msg: 'Song deleted successfully!' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { getSongsByPlaylist, deleteSuggestedSong, getAllSongsForUser, deleteSongFromQueue, getAllSongsByUserNoAuth, getSuggestSongs, suggestSong,addToQueue, getQueueSongsForUser, getQueueSongsRequests, updateSongStatus };
