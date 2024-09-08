const mongoose = require("mongoose");
const { Schema, model } = mongoose;

function mask(payload, sensitiveKeys = ['password', 'pass', 'token', 'ssn', 'secret', 'authorization']) {    
    if (typeof payload !== 'object' || payload === null) {
      return payload;
    }

    const sanitizedPayload = Array.isArray(payload) ? [] : {};
  
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        if (typeof payload[key] === 'object') {
          sanitizedPayload[key] = mask(payload[key], sensitiveKeys);
        } else if (sensitiveKeys.includes(key.toLowerCase())) {
          sanitizedPayload[key] = '***************';
        } else {
          sanitizedPayload[key] = payload[key];
        }
      }
    }
    return sanitizedPayload;
  }
 
const HeaderSchema = new Schema({
    Host: String,
    Accept: String,
    Authorization: String,
    'Content-Type': String,
    'Content-Length': String,
    /// user-agent (to be added) 
});

const RequestSchema = new Schema({
    timestamp: {
        type: String,
        required: true,
        trim: true,
    },
    method: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    payload: {
        type: Object,
    },
    from: {
        type: String,
        required: true,
        trim: true,
    },
    to: {
        type: String,
        required: true,
        trim: true,
    },
    headers: {
        type: HeaderSchema,
    },
    // auto-generated
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
    },
});

/// used to hide secret keys
RequestSchema.pre("save", function(next) {  
      this.payload = mask(this.payload);
      next();
});

/// used to hide secret keys
HeaderSchema.pre("save", function(next) {
  this.Authorization = '***************';
  next();
});

const requests = model("requests", RequestSchema);
module.exports = requests;