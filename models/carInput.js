// const mongoose = require('mongoose');

// const carSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   tags: [String],
//   images: [{ type: String }], // Stores URLs or file paths of uploaded images
// });

// module.exports = mongoose.model('Car', carSchema);



const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: {
    type: [String], // Array of strings
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [
    {
      data: Buffer, // Field to store the image buffer (binary data)
      contentType: String, // Field to store the image content type (e.g., 'image/jpeg')
    },
  ],

  // images: {
  //   type: [String],  // Array of strings to store image filenames or URLs
  //   default: []
  // }
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
