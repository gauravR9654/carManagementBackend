const express = require('express');
const router = express.Router();
const CarSearch = require('../../models/searchCar'); // CarSearch schema for the search
const Car = require('../../models/carInput')

// Global search for cars by title, description, or tags
router.get('/global-search', async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim(); // Get the keyword from query params and trim extra spaces
    console.log(keyword);

    let searchQuery = {};

    if (keyword) {
      // If a keyword is provided, search by title, description, or tags with case-insensitive regex
      searchQuery = {
        $or: [
          { title: { $regex: keyword, $options: 'i' } }, // Match title, case-insensitive
          { description: { $regex: keyword, $options: 'i' } }, // Match description, case-insensitive
          { tags: { $regex: keyword, $options: 'i' } } // Match tags, case-insensitive
        ]
      };
    }

    // Perform the search in the database
    console.log('Search Query:', JSON.stringify(searchQuery, null, 2));

    const cars = await Car.find(searchQuery); // Get cars based on search query or all cars if no keyword

    // Return the cars that match the search criteria (or all cars if no keyword is provided)
    return res.status(200).json({ cars });
  } catch (error) {
    console.error('Error during global search:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
