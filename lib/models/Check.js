var mongoose = require('mongoose'), 
  Schema = mongoose.Schema, 
  ObjectId = Schema.Types.ObjectId;


var checkSchema = new Schema({
    id: {type: ObjectId},
    createdAt: {type: Date, default: Date.now},
    checkNumber: {type: Number, min: 1, required: true},
    checkDate: {type: Date, default: Date.now},
    checkAmount: {type: Number, min: 0, default: 0},
    checkPayee: {type: String, required: true},
    checkMemo: {type: String, required: false},
    checkReconciled: {type: Boolean, default: false},
    checkReconciledDate: {type: Date, default: new Date(+0)}
});

module.exports = mongoose.model('Check', checkSchema);
