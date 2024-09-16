import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddPlaylist = () => {
  const [formData, setFormData] = useState({
    playlistName: '',
  });

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.playlistName) {
      toast.error('Please provide a playlist name.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post('http://localhost:5000/api/playlists', formData, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      toast.success('Playlist created successfully!');

      setFormData({
        playlistName: '',
      });

    } catch (error) {
      toast.error('Error creating playlist. Please try again.');
      console.error('There was an error creating the playlist:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <main className="content">
        <div className="form_container">
          <h2>Add New Playlist</h2>
          <form onSubmit={handleSubmit}>
            <div className="form_group">
              <label htmlFor="playlistName">Playlist Name:</label>
              <input
                type="text"
                id="playlistName"
                name="playlistName"
                value={formData.playlistName}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit">Submit</button>
          </form>
          <ToastContainer />
        </div>
      </main>
    </div>
  );
};

export default AddPlaylist;
