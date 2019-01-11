'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId } = req.query;
  const regex = new RegExp(searchTerm, 'i');

  let filter = {};

  if (folderId) {
    filter.folderId = folderId;
  }

  if (searchTerm) {
    filter.$or = [
      { title: regex },
      { content: regex }
    ];
  }

  Note
    .find(filter)
    .sort({ updatedAt: 'desc' })
    .then(notes => res.json(notes))
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note
    .findById(id)
    .then(note => {
      return note ? res.json(note) : next();
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId } = req.body;

  const newNote = { title, content, folderId };

  /***** Never trust users - validate input *****/
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  Note
    .create(newNote)
    .then(note => {
      res
        .location(`${req.originalUrl}/${note.id}`)
        .status(201)
        .json(note);
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;

  const updateObj = {};
  const updateableFields = ['title', 'content', 'folderId'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (updateObj.folderId && !mongoose.Types.ObjectId.isValid(updateObj.folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  Note
    .findByIdAndUpdate(id, updateObj, { new: true })
    .then(note => res.json(note))
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note
    .findByIdAndDelete(id)
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = router;