'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI, MONGOOSE_OPTIONS } = require('../config');

const Tag = require('../models/tags');

const { tags } = require('../db/data');

describe('Tags Integration Tests', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, MONGOOSE_OPTIONS)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      Tag.insertMany(tags),
      Tag.createIndexes()
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/tags', function () {
    it('should return the correct number of tags', function () {
      return Promise.all([
        Tag.find(),
        chai.request(app).get('/api/tags')
      ])
        // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct fields sorted by name', function () {
      return Promise.all([
        Tag.find().sort({ name: 'asc' }),
        chai.request(app).get('/api/tags')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.include.all.keys('id', 'name', 'createdAt', 'updatedAt');
            expect(item.id).to.equal(data[i].id);
            expect(item.name).to.equal(data[i].name);
            expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
          });
        });
    });
  });

  describe('GET /api/tags/:id', function () {
    it('should return the correct tag', function () {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return a 404 error when it cannot find a tag', function () {
      let badId = '111111111111111111111199';

      return chai.request(app).get(`/api/tags/${badId}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should throw an error if given a bad id', function () {
      const invalidId = '999';

      return chai.request(app)
        .get(`/api/tags/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });
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