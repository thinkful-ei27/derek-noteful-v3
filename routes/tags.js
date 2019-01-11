'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Tag = require('../models/tags');

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

// UPDATE A TAG

// DELETE A TAG

module.exports = router;