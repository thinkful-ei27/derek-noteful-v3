'use strict';

const express = require('express');
const Folder = require('../models/folders');
const router = express.Router();

// GET/READ ALL ITEMS
router.get('/', (req, res, next) => {
  res.sendStatus('200');
});

// GET/READ A SINGLE ITEM
router.get('/:id', (req, res, next) => {
  res.sendStatus('200');
});

// POST/CREATE AN ITEM

// PUT/UPDATE A SINGLE ITEM

// DELETE/REMOVE A SINGLE ITEM

module.exports = router;