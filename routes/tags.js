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

// CREATE A TAG

// UPDATE A TAG

// DELETE A TAG

module.exports = router;