'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Folder = require('../models/folders');
const Note = require('../models/note');

// GET/READ ALL ITEMS
router.get('/', (req, res, next) => {
  Folder
    .find()
    .sort({ name: 'asc' })
    .then(folders => res.json(folders))
    .catch(err => next(err));
});

// GET/READ A SINGLE ITEM
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Folder
    .findById(id)
    .then(folder => {
      return folder ? res.json(folder) : next();
    })
    .catch(err => next(err));
});

// POST/CREATE AN ITEM
router.post('/', (req, res, next) => {
  const { name } = req.body;

  const newFolder = { name };

  /***** Never trust users - validate input *****/
  if (!newFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Folder
    .create(newFolder)
    .then(folder => {
      res
        .location(`${req.originalUrl}/${folder.id}`)
        .status(201)
        .json(folder);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// PUT/UPDATE A SINGLE ITEM
router.put('/:id', (req, res, next) => {
  const { id } = req.params;

  const updateObj = {};
  const updateableFields = ['name'];

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

  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Folder
    .findByIdAndUpdate(id, updateObj)
    .then(folder => res.json(folder))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// DELETE/REMOVE A SINGLE ITEM
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Promise.all([
    Folder.findByIdAndDelete(id),
    Note.updateMany({ folderId: id }, { $unset: { folderId: '' }})
  ])
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = router;