var mongoose = require('mongoose'),
    Schema = mongoose.Schema, 
    ObjectId = Schema.Types.ObjectId;

var userSchema = new Schema({
    id: {type: ObjectId},
    username: {type: String, required: true},
    password: {type: String, required: true}
});

module.exports = mongoose.model('User', userSchema);
