// src/UserRequests.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Alert, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from './config'; // Import BASE_URL from config

const UserRequests = () => {
  const [musics, setMusics] = useState([]);
  const location = useLocation();

  // Extract userId from URL
  const getUserIdFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get('userId');
  };

  const userId = getUserIdFromURL(); // Extract userId

  // Fetch queued musics for the user
  const fetchQueueMusics = async () => {
    try {
      if (userId) {
        const response = await axios.get(`${BASE_URL}/api/playlist/queue-songs-requests`, {
          params: { userId },
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        console.log('Fetched queue musics:', response.data);
        setMusics(response.data); // Set the musics in the state
      } else {
        toast.error('No userId found in URL.');
      }
    } catch (error) {
      console.error('Error fetching queue music:', error);
      toast.error('Error fetching queue music. Please try again.');
    }
  };

  useEffect(() => {
    fetchQueueMusics();
  }, [userId]);

  // Update song status
  const updateSongStatus = async (songId) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/playlist/update-song-status`,
        { songId },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );

      console.log('Song status updated:', response.data);
      toast.success('Song status updated successfully!');

      // Update the musics state to remove the song if its status is updated to 1
      if (response.data.status === 1) {
        setMusics(prevMusics => prevMusics.filter(music => music._id !== songId));
      } else {
        // Refresh the list of musics if status is not 1 (optional)
        fetchQueueMusics();
      }
    } catch (error) {
      console.error('Error updating song status:', error);
      toast.error('Error updating song status. Please try again.');
    }
  };

  return (
    <div className='admin-dashboard'>
      <main className="content">
        <div className='container mt-5'>
          <h1 className="mb-4">Songs on User Requests</h1>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Serial #</th>
                <th>Song Name</th>
                <th>File</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {musics.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <Alert variant="info">No songs found.</Alert>
                  </td>
                </tr>
              ) : (
                musics.map((music, index) => (
                  <tr key={music._id}>
                    <td>{index + 1}</td>
                    <td>{music.songName} - {music.artistName}</td>
                    <td>
                      <audio controls>
                        <source 
                          src={`${BASE_URL}/${music.song}`} 
                          type="audio/mpeg"
                          onError={() => toast.error('Error loading audio file.')}
                        />
                        Your browser does not support the audio element.
                      </audio>
                    </td>
                    <td>
                      <Button 
                        variant="primary" 
                        className="ms-2"
                        onClick={() => updateSongStatus(music._id)} // Call handler with song ID
                      >
                        Add To Queue
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <ToastContainer />
        </div>
      </main>
    </div>
  );
};

export default UserRequests;
