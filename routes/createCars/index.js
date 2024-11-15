const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp'); // Image processing library
const Car = require('../../models/carInput');

// Configure multer for memory storage (storing image buffers)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB each
}).array('photos', 10); // Allow up to 10 photos

// POST /add-car - Adding car with image upload (using multer buffer)
router.post('/add-car', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading files', error: err.message });
    }

    try {
      const { token } = req.query;
      const { title, description, tags } = req.body;

      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required.' });
      }

      // Process image buffers
      const photoBuffers = req.files.map(file => ({
        data: file.buffer, // Store the image buffer
        contentType: file.mimetype // Store the file's content type (e.g., 'image/jpeg')
      }));

      // Create a new car entry
      const newCar = new Car({
        title,
        description,
        userId : token,
        tags: tags || [],
        images: photoBuffers // Save the buffer data as images
      });

      // Save the car entry to the database
      await newCar.save();

      res.status(201).json({ message: 'Car added successfully', car: newCar });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
});

// GET /get-cars - Fetch cars and convert stored image buffers to Base64 with image processing
const processImageBuffers = async (images) => {
  const processedImages = await Promise.all(
    images.map(async (image) => {
      // Resize or alter the image buffer using sharp
      const alteredBuffer = await sharp(image.data)
        .resize({ width: 400, height: 300 }) // Example: resize to 400x300
        .toBuffer();

      // Convert the altered buffer to base64 and return it
      return `data:${image.contentType};base64,${alteredBuffer.toString('base64')}`;
    })
  );
  return processedImages;
};

// Helper function to process cars and their images
const getCarsWithBase64Images = async (cars) => {
  return await Promise.all(
    cars.map(async (car) => ({
      ...car._doc, // Include the rest of the car's properties
      images: await processImageBuffers(car.images) // Process and alter buffer data
    }))
  );
};
// route to get
router.get('/get-cars', async (req, res) => {
  try {
    const { carID, keyword, token } = req.query;  // Get carID and keyword from the query string (optional)
    let searchQuery = {};

    // If a keyword is provided, search by title, description, or tags
    if (keyword) {
      searchQuery = {
        $or: [
          { title: { $regex: keyword, $options: 'i' } }, // Match title, case-insensitive
          { description: { $regex: keyword, $options: 'i' } }, // Match description, case-insensitive
          { tags: { $regex: keyword, $options: 'i' } } // Match tags, case-insensitive
        ]
      };
    }

    // If carID is provided, filter by the specific car ID
    if (carID) {
      searchQuery._id = carID;
    }

    // Fetch the cars based on the search query
    // const cars = await Car.find(searchQuery);
    const cars = await Car.find({userId: token, ...searchQuery});

    // If no cars are found
  
    // Process images and return the cars with base64-encoded images
    const carsWithImages = await getCarsWithBase64Images(cars);
    return res.status(200).json({ cars: carsWithImages });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }



});
// Route to update a car
router.put('/update-car', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading files', error: err.message });
    }

    try {
      const { carID } = req.query; // Assuming carID is passed as a query parameter
      const { title, description, tags, photos } = req.body; // Data from the request body

      // Validate car ID
      if (!carID) {
        return res.status(400).json({ message: 'Car ID is required.' });
      }

      // Find the car by ID
      const car = await Car.findById(carID);
      if (!car) {
        return res.status(404).json({ message: 'Car not found.' });
      }

      // Update text fields if provided
      if (title) car.title = title;
      if (description) car.description = description;
      if (tags) car.tags = tags.split(','); // Assuming tags are sent as a comma-separated string

      // Handle new image uploads
      const newPhotos = req.files.map(file => ({
        data: file.buffer, // Image buffer
        contentType: file.mimetype, // Image MIME type
      }));

      // Append new photos if any
      if (newPhotos.length > 0) {
        car.images = [...car.images, ...newPhotos];
      }

      // Remove any existing images if specified
      if (photos) {
        const parsedExistingImages = JSON.parse(photos); // Parse JSON string of existing image URLs

        // Keep only the images specified in the request
        car.images = car.images.filter((image, index) => parsedExistingImages.includes(image._id.toString()));
      }

      // Save the updated car entry
      await car.save();

      res.status(200).json({ message: 'Car updated successfully', car });
    } catch (error) {
      console.error('Error updating car:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
});

// Route to delete a car
router.delete('/delete-car', async (req, res) => {
try {
  const { carID } = req.query; // Get the carID from the query string

  // Ensure carID is provided
  if (!carID) {
    return res.status(400).json({ message: 'carID is required to delete a car.' });
  }

  // Find the car by carID and delete it
  const deletedCar = await Car.findByIdAndDelete(carID);

  // If the car is not found
  if (!deletedCar) {
    return res.status(404).json({ message: 'Car not found with the provided carID.' });
  }

  // Return success message
  return res.status(200).json({ message: 'Car deleted successfully.' });
} catch (error) {
  console.error('Error deleting car:', error);
  res.status(500).json({ message: 'Server error', error: error.message });
}
});
module.exports = router;
