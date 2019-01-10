'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folders');

const { folders } = require('../db/data');

chai.use(chaiHttp);

describe('Folders Integration Tests', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Folder.insertMany(folders);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  }); 

  describe('GET /api/folders', function () {
    it('should return the correct number of folders');
    it('should return a list with the correct fields sorted by name');
  });

  describe('GET /api/folders/:id', function () {
    it('should return the correct folder');
    it('should return a 404 error when it cannot find a folder');
  });

  describe('POST /api/folders', function () {
    it('should create and return a new folder when provided with valid data');
    it('should throw an error when provided with invalid data');
    it('should warn the user if the folder name already exists');
  });

  describe('PUT /api/folders/:id', function () {
    it('should update the folder when provided with valid data');
    it('should throw an error when provided invalid data');
    it('should warn the user if the folder name already exists');
  });

  describe('DELETE /api/notes', function () {
    it('should delete a folder');
    it('should respond with an error if given a bad id');
  });
});