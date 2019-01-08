'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// Find/Search for notes using `Note.find`
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(() => {
//     const searchTerm = 'lady gaga';
//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm, $options: 'i' };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Find note by id using `Note.findById`
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(() => {
//     // Grab some notes
//     return Note.find();
//   })
//   .then(results => {
//     // set noteId
//     const noteId = results[0]._id;
//     return Note.findById(noteId);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .catch(err => console.error(err));

// Create a new note using `Note.create`
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(() => {
//     const newData = {
//       title: 'Note created by scratch',
//       content: 'This note was created by a scratch query'
//     };

//     return Note.create(newData);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .catch(err => console.error(err));

// Update a note by id using `Note.findByIdAndUpdate`
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(() => {
//     // Grab some notes
//     return Note.find();
//   })
//   .then(results => {
//     // set noteId
//     const noteId = results[0]._id;

//     const updateData = {
//       title: 'Note updated by scratch',
//       content: 'This note was updated by a scratch query'
//     };

//     return Note.findByIdAndUpdate(noteId, updateData);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .catch(err => console.error(err));

// Delete a note by id using `Note.findByIdAndRemove`
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(() => {
//     // Grab some notes
//     return Note.find();
//   })
//   .then(results => {
//     // set noteId
//     const noteId = results[0]._id;

//     return Note.findByIdAndRemove(noteId);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .catch(err => console.error(err));