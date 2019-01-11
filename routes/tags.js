'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Tag = require('../models/tags');
const Note = require('../models/note');

// READ ALL TAGS
router.get('/', (req, res, next) => {
  Tag
    .find()
    .sort({ name: 'asc' })
    .then(tags => res.json(tags))
    .catch(err => next(err));
});

// READ A SINGLE TAG
router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Tag
    .findById(id)
    .then(tag => {
      return tag ? res.json(tag) : next();
    })
    .catch(err => next(err));
});

// CREATE A TAG
router.post('/', (req, res, next) => {
  const { name } = req.body;

  const newTag = { name };

  /***** Never trust users - validate input *****/
  if (!newTag.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Tag
    .create(newTag)
    .then(tag => {
      res
        .location(`${req.originalUrl}/${tag.id}`)
        .status(201)
        .json(tag);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('That tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// UPDATE A TAG
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

  Tag
    .findByIdAndUpdate(id, updateObj, { new: true })
    .then(tag => res.json(tag))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('That tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// DELETE A TAG
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Promise.all([
    Tag.findByIdAndDelete(id),
    Note.updateMany({}, { $pull: { tags: id }})
  ])
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = router;