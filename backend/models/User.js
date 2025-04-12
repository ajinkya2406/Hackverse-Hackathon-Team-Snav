const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  educationStatus: { 
    type: String, 
    required: true,
    enum: ['school', 'college', 'working']
  },
  phoneNumber: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }
});

module.exports = mongoose.model('User', UserSchema);
