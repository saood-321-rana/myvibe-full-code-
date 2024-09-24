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
  const [favorites, setFavorites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const location = useLocation();
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestedSong, setSuggestedSong] = useState('');

  const getUserIdFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get('userId');
  }, [location.search]);

  useEffect(() => {
    const fetchMusics = async () => {
      try {
        const userId = getUserIdFromURL();
        const response = await axios.get(`${BASE_URL}/api/playlist/public-user-songs`, {
          params: { userId },
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setMusics(response.data);
      } catch (error) {
        toast.error('Error fetching music. Please try again.');
      }
    };

    fetchMusics();

    // Show review modal after 30 seconds
    const timer = setTimeout(() => {
      setShowReviewModal(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, [getUserIdFromURL]);

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

      const storedUserId = localStorage.getItem('userId');
      const urlUserId = getUserIdFromURL();
      const userId = storedUserId || urlUserId;

      const response = await axios.post(`${BASE_URL}/api/playlist/add-to-queue`, {
        songId: selectedMusic._id,
        userId,
        status: storedUserId ? 1 : 0,
      });

      toast.success(response.data.msg);
      handleCloseModal();
    } catch (error) {
      toast.error('Song is already in queue. Please try another one.');
    }
  };

  const handleFavoriteToggle = (music) => {
    setFavorites((prevFavorites) => (
      prevFavorites.includes(music._id)
        ? prevFavorites.filter(id => id !== music._id)
        : [...prevFavorites, music._id]
    ));
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleReviewSubmit = () => {
    toast.success('Thank you for your feedback!');
    setShowReviewModal(false);
  };
  // const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const handleShowSuggestionModal = () => {
    setShowSuggestionModal(true);
  };

  const handleCloseSuggestionModal = () => {
    setShowSuggestionModal(false);
    setSuggestedSong('');
  };

  const handleSuggestSong = async () => {
    try {
      const userId = getUserIdFromURL();
      const response = await axios.post(`${BASE_URL}/api/playlist/suggest/${userId}`, {
        songName: suggestedSong,
      });
      toast.success(response.data.msg);
      handleCloseSuggestionModal();
    } catch (error) {
      toast.error('Error suggesting the song. Please try again.');
    }
  };
  

  const storedUserId = localStorage.getItem('userId');
  const urlUserId = getUserIdFromURL();
  const queueLink = storedUserId
    ? `/queue?userId=${storedUserId}`
    : `/queue?userId=${urlUserId}`;

  return (
    <div className='container mt-4' style={{ paddingBottom: '60px' }}>
      <div className='lock'>
        <img src='images/logo.png' width={230} height={100} alt="Logo" />
      </div>
      <h1 className="mb-2 mt-2">Welcome to MyVibe!</h1>
      <h3 className="mb-5 text-center">Choose titles from the playlist, like them, sync, modify the queue:</h3>

      {musics.map((music) => (
        <div key={music._id} style={{ cursor: 'pointer' }} className="song-item mb-5">
          <h3 onClick={() => handleShowModal(music)}>{music.songName} - {music.artistName}</h3>
          <i
            className={`bx ${favorites.includes(music._id) ? 'bxs-heart' : 'bx-heart'} trc`}
            style={{ color: favorites.includes(music._id) ? 'red' : 'black', cursor: 'pointer' }}
            onClick={() => handleFavoriteToggle(music)}
          ></i>
          <hr />
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

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header>
          <img src='images/logo.png' alt="MyVibe Logo" className="mx-auto d-block" width={150} />
        </Modal.Header>
        <Modal.Body className="text-center">
          <h4>Thanks for using MyVibe!</h4>
          <Button variant="dark" onClick={() => setShowReviewModal(false)} className="mt-3">Back to Playlist</Button>
          <h5 className="mt-4">Rate our service</h5>
          <div className="d-flex justify-content-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`bx bxs-star ${star <= rating ? 'text-warning' : ''}`}
                style={{ fontSize: '2rem', cursor: 'pointer' }}
                onClick={() => handleRatingClick(star)}
              ></i>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="dark" onClick={handleReviewSubmit}>Send</Button>
        </Modal.Footer>
        <h4 className='text-center'>Follow us on social media</h4>
        <div class="text-center mb-3">
         <a href='#'><i class="btn btn-dark btn-lg fa fa-facebook"></i></a>
         <a href='#'><i class="btn btn-dark btn-lg fa fa-instagram ml-3"></i></a>
         <a href='#'><i class="btn btn-dark btn-lg fa fa-linkedin ml-3"></i></a>
         
        </div>
      </Modal>

      {/* Suggestion Modal */}
      <Modal show={showSuggestionModal} onHide={handleCloseSuggestionModal}>
        <Modal.Header closeButton>
          <Modal.Title>Suggest a Song</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Enter song title" 
            value={suggestedSong} 
            onChange={(e) => setSuggestedSong(e.target.value)} 
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSuggestionModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSuggestSong}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Fixed Footer */}
      <div className="fixed-bottom bg-light text-center p-3">
        <Button type='button' className='btn-lg' style={{background: 'red', border: '1px solid red'}} onClick={handleShowSuggestionModal}>
        Suggest Song
      </Button>
        <Link to={queueLink} className="me-2 ml-3">
          <Button className='btn-lg' variant="dark">See Queue</Button>
        </Link> 
         </div>

      <ToastContainer />
    </div>
  );
};

export default EndUsers;
