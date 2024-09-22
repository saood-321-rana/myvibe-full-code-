import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import BASE_URL from './config'; // Import the base URL

const EndUsers = () => {
  const [musics, setMusics] = useState([]);
  const [favorites, setFavorites] = useState([]); // New state for favorites
  const [showModal, setShowModal] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [showSplash, setShowSplash] = useState(true); // Splash screen state
  const location = useLocation(); // Access the URL

  // Function to extract userId from query params
  const getUserIdFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    console.log('Extracted User ID from URL:', userId); // Debugging line
    return userId;
  }, [location.search]);

  useEffect(() => {
    const fetchMusics = async () => {
      try {
        const userId = getUserIdFromURL(); // Get userId from URL

        const response = await axios.get(`${BASE_URL}/api/playlist/public-user-songs`, {
          params: { userId }, // Pass userId in query params
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });

        console.log('Fetched musics:', response.data); // Debugging output
        setMusics(response.data);
      } catch (error) {
        console.error('Error fetching music:', error);
        toast.error('Error fetching music. Please try again.');
      }
    };

    // Fetch music and hide splash screen after 2 seconds
    fetchMusics();
    
  }, [getUserIdFromURL, location]);

  const handleShowModal = (music) => {
    console.log('Selected song:', music); // Debugging line
    setSelectedMusic(music);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMusic(null);
  };

  const handleAddToQueue = async () => {
    try {
      if (!selectedMusic) return;

      const storedUserId = localStorage.getItem('userId');
      const urlUserId = getUserIdFromURL();

      let userId;
      let status;

      if (storedUserId) {
        userId = storedUserId;
        status = 1; // Logged in
      } else if (urlUserId) {
        userId = urlUserId;
        status = 0; // Not logged in, using URL userId
      } else {
        toast.error("User ID not found.");
        return;
      }

      console.log('Adding song to queue with details:', { 
        songId: selectedMusic._id, 
        userId: userId,
        status: status
      });

      const response = await axios.post(
        `${BASE_URL}/api/playlist/add-to-queue`,
        { 
          songId: selectedMusic._id,
          userId: userId,
          status: status
        }
      );

      toast.success(response.data.msg); 
      handleCloseModal();
    } catch (error) {
      console.error('Error adding song to queue:', error.response?.data || error);
      toast.error('Song is already in queue. Please try another one.');
    }
  };

  const handleFavoriteToggle = (music) => {
    const isFavorited = favorites.includes(music._id);
    if (isFavorited) {
      setFavorites(favorites.filter(id => id !== music._id)); // Remove from favorites
    } else {
      setFavorites([...favorites, music._id]); // Add to favorites
    }
  };

  const storedUserId = localStorage.getItem('userId'); // Get userId from local storage
  const urlUserId = getUserIdFromURL(); // Extract userId from the URL
  const queueLink = storedUserId 
    ? `/queue?userId=${storedUserId}`  // If userId exists in local storage
    : `/queue?userId=${urlUserId}`; // If userId doesn't exist in local storage, use userId from URL

  
  return (
    <div className='container mt-4'>
      <div className='lock'>
        <img src='images/logo.png' width={230} height={100} alt="Logo" />
      </div>
      <h1 className="mb-2 mt-2">Welcome to MyVibe!</h1>
      <h3 className="mb-5 text-center">Choose titles from the playlist, like them, sync, modify the queue:</h3>

      {musics.map((music) => (
        <div 
          key={music._id} 
          style={{ cursor: 'pointer' }} 
          className="song-item" 
        >
          <h3 onClick={() => handleShowModal(music)}>{music.songName} - {music.artistName}</h3>
          <i 
            className={`bx ${favorites.includes(music._id) ? 'bxs-heart' : 'bx-heart'} trc`} 
            style={{ color: favorites.includes(music._id) ? 'red' : 'black', cursor: 'pointer' }}
            onClick={() => handleFavoriteToggle(music)}
          ></i>
          <hr/>
        </div>
      ))}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Body>
          {selectedMusic ? (
            <div className="text-center">
              <img src='images/logo.png' width={100} height={50} alt="Logo" />
              <h2 className="mt-3 order-summary-heading">Order summary</h2>
              <h2 className="mt-3">Song title:</h2>
              <h4 className="mt-3">{selectedMusic.songName} - {selectedMusic.artistName}</h4>
            </div>
          ) : (
            <p>No music selected</p>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button className='btn-lg btn' variant='dark' onClick={handleAddToQueue}>Add to queue</Button>
          <Button className='btn-lg btn ms-2' variant='dark' onClick={handleCloseModal}>Play Next</Button>
        </Modal.Footer>
      </Modal>

      <div className='bnn'>
      <Link to={queueLink} className="see-queue-btn">
        <Button variant="dark">See Queue</Button>
      </Link>
    </div>

      <ToastContainer />
    </div>
  );
};

export default EndUsers;
