'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI, MONGOOSE_OPTIONS } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folders');

const { notes, folders } = require('../db/data');

const expect = chai.expect;
chai.use(chaiHttp);

const NOTE_KEYS = ['id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags'];

describe('Notes Integration Tests', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, MONGOOSE_OPTIONS)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Folder.createIndexes()
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/notes', function () {
    it('should return the correct number of notes', function () {
      // 1) Call the database **and** the API
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct right fields', function () {
      return Promise.all([
        Note.find().sort({ updatedAt: 'desc' }),
        chai.request(app).get('/api/notes')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt');
            expect(item.id).to.equal(data[i].id);
            expect(item.title).to.equal(data[i].title);
            expect(item.content).to.equal(data[i].content);
            expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
          });
        });
    });

    it('should only return notes that include the searchTerm', function () {
      const searchTerm = 'gaga';
      const regex = new RegExp(searchTerm, 'i');
      return Promise.all([
        // Find all notes that fit the search term
        Note.find({ $or: [{ title: regex }, { content: regex }] }),
        chai.request(app).get(`/api/notes/?searchTerm=${searchTerm}`)
      ])
        .then(([data, res]) => {
          expect(res.body).to.have.length(data.length);
          res.body.forEach(note => {
            expect(note).to.not.satisfy(note => {
              return note.title.includes(searchTerm) || note.content.includes(searchTerm);
            });
            expect(note).to.satisfy(note => {
              return note.title.toLowerCase().includes(searchTerm) || note.content.toLowerCase().includes(searchTerm);
            });
          });
        });
    });

    it('should only return notes within a specific folder', function () {
      let folderId;

      return Folder.findOne()
        .then(folder => {
          folderId = folder.id;

          return Promise.all([
            Note.find({ folderId: folder.id }),
            chai.request(app).get(`/api/notes/?folderId=${folder.id}`)
          ]);
        })
        .then(([data, res]) => {
          expect(res.body).to.have.length(data.length);
          res.body.forEach(note => {
            expect(note.folderId).to.equal(folderId);
          });
        });
    });
  });

  describe('GET /api/notes/:id', function () {
    it('should return the correct note', function () {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(NOTE_KEYS);

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return a 404 error when it cannot find a note', function () {
      let badId = '111111111111111111111199';

      return chai.request(app).get(`/api/notes/${badId}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should respond with an error if given a bad id', function () {
      return chai.request(app)
        .get('/api/notes/999')
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('POST /api/notes', function () {
    it('should create and return a new item when provided with valid data', function () {
      let res;
      Folder.findOne()
        .then(folder => {

          const newNote = {
            'title': 'Test note created by chai',
            'content': 'This note was created for testing purposes only',
            'folderId': folder.id
          };

          // 1) First, call the API
          return chai.request(app)
            .post('/api/notes')
            .send(newNote);
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(NOTE_KEYS);
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should throw an error when `title` is missing', function () {
      const newNote = { content: 'This note does not have a title' };
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

    it('should throw an error when folderId is not valid', function () {
      const newNote = {
        'title': 'Test note created by chai',
        'content': 'This note was created for testing purposes only',
        'folderId': 'DOES-NOT-EXIST' 
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(function (res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
          expect(res.body.message).to.equal('The `folderId` is not valid');
        });
    });
  });

  describe('PUT /api/notes/:id', function () {
    it('should update the note when provided valid data', function () {
      const updateData = {
        title: 'Title updated by chai',
        content: 'This note is being updated by a chai test'
      };

      let originalData;

      return Note.findOne()
        .then(data => {
          originalData = data;
          return chai.request(app)
            .put(`/api/notes/${originalData._id}`)
            .send(updateData);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(NOTE_KEYS);

          return Note.findById(res.body.id);
        })
        .then(note => {
          expect(note.id).to.equal(originalData.id);
          expect(note.title).to.equal(updateData.title);
          expect(note.content).to.equal(updateData.content);
          expect(note.createdAt.getTime()).to.equal(originalData.createdAt.getTime());
          expect(note.updatedAt.getTime()).to.not.equal(originalData.updatedAt.getTime());
        });
    });
    it('should throw an error when `title` is missing', function () {
      const updateData = { content: 'This note doesn not have a title' };

      let originalData;

      return Note.findOne()
        .then(data => {
          originalData = data;
          return chai.request(app)
            .put(`/api/notes/${originalData._id}`)
            .send(updateData);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
          expect(res.body.message).to.equal('Missing `title` in request body');

          return Note.findById(originalData.id);
        })
        .then(note => {
          expect(note.id).to.equal(originalData.id);
          expect(note.title).to.equal(originalData.title);
          expect(note.content).to.equal(originalData.content);
          expect(note.createdAt.getTime()).to.equal(originalData.createdAt.getTime());
          expect(note.updatedAt.getTime()).to.equal(originalData.updatedAt.getTime());
        });
    });

    it('should throw an error when folderId is not valid', function () {
      const updateData = {
        'title': 'Test note updated by chai',
        'content': 'This note was updated for testing purposes only',
        'folderId': 'DOES-NOT-EXIST' 
      };

      let originalData;

      return Note.findOne()
        .then(data => {
          originalData = data;
          return chai.request(app)
            .put(`/api/notes/${originalData._id}`)
            .send(updateData);
        })
        .then(function (res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
          expect(res.body.message).to.equal('The `folderId` is not valid');
          return Note.findById(originalData.id);
        })
        .then(note => {
          expect(note.id).to.equal(originalData.id);
          expect(note.title).to.equal(originalData.title);
          expect(note.content).to.equal(originalData.content);
          expect(note.folderId).to.deep.equal(originalData.folderId);
          expect(note.createdAt.getTime()).to.equal(originalData.createdAt.getTime());
          expect(note.updatedAt.getTime()).to.equal(originalData.updatedAt.getTime());
        });
    });
  });

  describe('DELETE /api/notes', function () {
    it('should delete a note', function () {
      let note;

      return Note.findOne()
        .then(data => {
          note = data;

          return chai.request(app)
            .del(`/api/notes/${note.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);

          return Note.findById(note.id);
        })
        .then(res => {
          expect(res).to.not.exist;
        });
    });

    it('should respond with an error if given a bad id', function () {
      return chai.request(app)
        .del('/api/notes/999')
        .then(res => {
          expect(res).to.throw;
        });
    });
  });
});