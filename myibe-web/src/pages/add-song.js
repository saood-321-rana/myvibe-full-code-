import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BASE_URL from './config'; // Adjust the path as needed

const AddSong = () => {
  const [formData, setFormData] = useState({
    songId: '',
    playlistId: '',
  });
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const songsResponse = await axios.get(`${BASE_URL}/api/music`, {
          headers: { 'x-auth-token': token },
        });
        setSongs(songsResponse.data);

        const playlistsResponse = await axios.get(`${BASE_URL}/api/playlists/user`, {
          headers: { 'x-auth-token': token },
        });
        setPlaylists(playlistsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error fetching data. Please try again.');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { songId, playlistId } = formData;

    if (!songId || !playlistId) {
      toast.error('Please select both a song and a playlist.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(`${BASE_URL}/api/playlist-songs/add-song-to-playlist`, {
        songId,
        playlistId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      toast.success(response.data.msg || 'Song added to playlist successfully!');
      setFormData({ songId: '', playlistId: '' }); // Reset form
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Error adding song to playlist. Please try again.';
      toast.error(errorMessage);
      console.error('There was an error adding the song to the playlist:', errorMessage);
    }
  };

  return (
    <div className="admin-dashboard">
      <main className="content">
        <div className="container mt-5">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title mb-4">Add Song to Playlist</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="songId" className="form-label">Select Song:</label>
                  <select
                    id="songId"
                    name="songId"
                    className="form-select"
                    value={formData.songId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a song</option>
                    {songs.length > 0 ? (
                      songs.map((song) => (
                        <option key={song._id} value={song._id}>
                          {song.songName}
                        </option>
                      ))
                    ) : (
                      <option value="">No songs available</option>
                    )}
                  </select>
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="playlistId" className="form-label">Select Playlist:</label>
                  <select
                    id="playlistId"
                    name="playlistId"
                    className="form-select"
                    value={formData.playlistId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a playlist</option>
                    {playlists.length > 0 ? (
                      playlists.map((playlist) => (
                        <option key={playlist._id} value={playlist._id}>
                          {playlist.playlistName}
                        </option>
                      ))
                    ) : (
                      <option value="">No playlists available</option>
                    )}
                  </select>
                </div>
                <button type="submit">Submit</button>
              </form>
            </div>
          </div>
          <ToastContainer />
        </div>
      </main>
    </div>
  );
};

export default AddSong;
