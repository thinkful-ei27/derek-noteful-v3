'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folders');
const Tag = require('../models/tags');

const { tags, folders, notes } = require('../db/data');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  })
  .then(([results, folders]) => {
    console.info(`Inserted ${results.length} Notes`);
    console.info(`Inserted ${folders.length} Folders`);
    console.info(`Inserted ${tags.length} Tags`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => console.error(err));