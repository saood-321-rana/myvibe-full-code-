import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const EndUsers = () => {
  const [musics, setMusics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
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

        const response = await axios.get(`http://localhost:5000/api/playlist/public-user-songs`, {
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

    fetchMusics();
  }, [getUserIdFromURL, location]);

  const handleShowModal = (music) => {
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
  
      // Retrieve userId from localStorage or URL
      const storedUserId = localStorage.getItem('userId'); // From localStorage
      const urlUserId = getUserIdFromURL(); // From the URL
  
      // Determine the status and userId
      let userId;
      let status;
  
      if (storedUserId) {
        userId = storedUserId;
        status = 1; // Logged in
      } else if (urlUserId) {
        userId = urlUserId;
        status = 0; // Not logged in, using URL userId
      } else {
        // If neither is available, return or handle error
        toast.error("User ID not found.");
        return;
      }
  
      console.log('Adding song to queue with details:', { 
        songId: selectedMusic._id, 
        userId: userId,
        status: status
      });
  
      const response = await axios.post(
        'http://localhost:5000/api/playlist/add-to-queue',
        { 
          songId: selectedMusic._id,  // Song ID
          userId: userId,              // User ID from either localStorage or URL
          status: status               // Status based on userId source
        }
      );
  
      toast.success(response.data.msg); 
      handleCloseModal();
    } catch (error) {
      console.error('Error adding song to queue:', error.response?.data || error);
      toast.error('Song is already in queue. Please try another one.');
    }
  };  
  

  const userId = getUserIdFromURL(); // Extract userId for the button link

  return (
    <div className='container mt-4'>
      <div className='lock'>
        <img src='images/logo.png' width={230} height={100} alt="Logo" />
      </div>
      <h1 className="mb-2 mt-2">Welcome to MyVibe!</h1>
      <h3 className="mb-5 text-center">Choose titles from the playlist, like them, sync, modify the queue:</h3>

      {musics.map((music) => (
        <div key={music._id} onClick={() => handleShowModal(music)} style={{ cursor: 'pointer'}}>
          <h3>{music.songName} - {music.artistName} <i className='bx bx-heart trc'></i></h3>
          <hr/>
          {/* Song file path */}
          {/* {music.song} */}
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
        <Link to={`/queue?userId=${userId}`} className="see-queue-btn">
          <Button variant="dark">See Queue</Button>
        </Link>
      </div>

      <ToastContainer />
    </div>
  );
};

export default EndUsers;
