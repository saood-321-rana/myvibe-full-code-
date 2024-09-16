const TimeSlot = require('../models/TimeSlot');

// @desc    Create a new time slot
// @route   POST /api/timeslots
// @access  Private
exports.createTimeSlot = async (req, res) => {
  try {
    const { timeSlotLength, price } = req.body;

    // Validation
    if (!timeSlotLength || !price) {
      return res.status(400).json({ msg: 'Please provide both time slot length and price' });
    }

    const newTimeSlot = new TimeSlot({
      timeSlotLength,
      price,
      userId: req.user.id, // Extract user ID from the JWT
    });

    await newTimeSlot.save();

    res.status(201).json({ msg: 'Time slot created successfully', timeSlot: newTimeSlot });
  } catch (error) {
    console.error('Error creating time slot:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get time slots for the currently logged-in user
// @route   GET /api/timeslots
// @access  Private
exports.getTimeSlots = async (req, res) => {
    try {
      // Get user ID from the request (assuming it's added to req.user in a middleware)
      const userId = req.user.id;
  
      // Fetch time slots for the specific user
      const timeSlots = await TimeSlot.find({ userId });
  
      res.json(timeSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  };
  
// @desc    Update time slot
// @route   PUT /api/timeslots/:id
// @access  Private
exports.updateTimeSlot = async (req, res) => {
    const { timeSlotLength, price } = req.body;
  
    try {
      const timeSlot = await TimeSlot.findById(req.params.id);
      if (!timeSlot) {
        return res.status(404).json({ msg: 'Time slot not found' });
      }
  
      console.log('Before update:', {
        timeSlotLength: timeSlot.timeSlotLength,
        price: timeSlot.price
      });
  
      if (timeSlotLength !== undefined) {
        timeSlot.timeSlotLength = timeSlotLength;
      }
      if (price !== undefined) {
        timeSlot.price = price;
      }
  
      console.log('Before save:', {
        timeSlotLength: timeSlot.timeSlotLength,
        price: timeSlot.price
      });
  
      await timeSlot.save();
  
      console.log('After save:', {
        timeSlotLength: timeSlot.timeSlotLength,
        price: timeSlot.price
      });
  
      res.json(timeSlot);
    } catch (error) {
      console.error('Error updating time slot:', error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  };    
    
// @desc    Delete time slot
// @route   DELETE /api/timeslots/:id
// @access  Private
exports.deleteTimeSlot = async (req, res) => {
    try {
      const timeSlot = await TimeSlot.findByIdAndDelete(req.params.id);
      if (!timeSlot) {
        return res.status(404).json({ msg: 'Time slot not found' });
      }
  
      res.json({ msg: 'Time slot removed' });
    } catch (error) {
      console.error('Error deleting time slot:', error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  };
  