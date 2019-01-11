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

// DELETE A TAG

module.exports = router;