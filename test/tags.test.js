'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

describe('Tags Integration Tests', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/tags', function () {
    it('should return the correct number of tags');
    it('should return a list with the correct fields sorted by name');
  });

  describe('GET /api/tags/:id', function () {
    it('should return the correct tag');
    it('should return a 404 error when it cannot find a tag');
  });

  describe('POST /api/tags/', function () {
    it('should create and return a new tag when provided with valid data');
    it('should throw an error when provided with invalid data');
    it('should throw an error when the tag name already exists');
  });

  describe('PUT /api/tags/:id', function () {
    it('should update the tag when provided with valid data');
    it('should throw an error when provided invalid data');
    it('should throw an error if the tag name already exists');
    it('should throw an error if given a bad id');
  });

  describe('DELETE /api/tags/:id', function () {
    it('should delete a tag');
    it('should remove the tag from all notes that had that tag');
    it('should throw an error if given a bad id');
  });
});