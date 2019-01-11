'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI, MONGOOSE_OPTIONS } = require('../config');

const Folder = require('../models/folders');
const Note = require('../models/note');

const { notes, folders } = require('../db/data');

chai.use(chaiHttp);

describe('Folders Integration Tests', function () {
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

  describe('GET /api/folders', function () {
    it('should return the correct number of folders', function () {
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
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
        Folder.find().sort({ name: 'asc' }),
        chai.request(app).get('/api/folders')
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

  describe('GET /api/folders/:id', function () {
    it('should return the correct folder', function () {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
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

    it('should return a 404 error when it cannot find a folder', function () {
      let badId = '111111111111111111111199';

      return chai.request(app).get(`/api/folders/${badId}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should throw an error if given a bad id', function () {
      const invalidId = '999';

      return chai.request(app)
        .get(`/api/folders/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });
  });

  describe('POST /api/folders', function () {
    it('should create and return a new folder when provided with valid data', function () {
      const newFolder = {
        'name': 'Test folder created by chai'
      };

      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Folder.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should throw an error when provided with invalid data', function () {
      const newFolder = {};
      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

    it('should throw an error if the folder name already exists', function () {
      return Folder.findOne()
        .then(existingFolder => {
          const newFolder = { name: existingFolder.name };
          return chai.request(app)
            .post('/api/folders')
            .send(newFolder);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
          expect(res.body.message).to.equal('The folder name already exists');
        });
    });
  });

  describe('PUT /api/folders/:id', function () {
    it('should update the folder when provided with valid data', function () {
      const updateData = {
        name: 'Folder updated by chai'
      };

      let originalData;

      return Folder.findOne()
        .then(data => {
          originalData = data;
          return chai.request(app)
            .put(`/api/folders/${originalData._id}`)
            .send(updateData);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          return Folder.findById(res.body.id);
        })
        .then(folder => {
          expect(folder.id).to.equal(originalData.id);
          expect(folder.name).to.equal(updateData.name);
          expect(folder.createdAt.getTime()).to.equal(originalData.createdAt.getTime());
          expect(folder.updatedAt.getTime()).to.not.equal(originalData.updatedAt.getTime());
        });
    });

    it('should throw an error when provided invalid data', function () {
      const updateData = {};

      let originalData;

      return Folder.findOne()
        .then(data => {
          originalData = data;
          return chai.request(app)
            .put(`/api/folders/${originalData._id}`)
            .send(updateData);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
          expect(res.body.message).to.equal('Missing `name` in request body');

          return Folder.findById(originalData.id);
        })
        .then(folder => {
          expect(folder.id).to.equal(originalData.id);
          expect(folder.name).to.equal(originalData.name);
          expect(folder.createdAt.getTime()).to.equal(originalData.createdAt.getTime());
          expect(folder.updatedAt.getTime()).to.equal(originalData.updatedAt.getTime());
        });
    });

    it('should warn the user if the folder name already exists', function () {
      const updateData = {};
      let existingName;

      return Folder.findOne()
        .sort({ name: 'asc' })
        .then(existingFolder => {
          existingName = existingFolder.name;
          return Folder.findOne().sort({ name: 'desc' });
        })
        .then(data => {
          updateData.name = existingName;
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(updateData);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('status', 'message');
          expect(res.body.message).to.equal('The folder name already exists');
        });
    });

    it('should throw an error if given a bad id', function () {
      return chai.request(app)
        .del('/api/folders/999')
        .then(res => {
          expect(res).to.throw;
        });
    });
  });

  describe('DELETE /api/folders/:id', function () {
    it('should delete a folder', function () {
      let folder;

      return Folder.findOne()
        .then(data => {
          folder = data;

          return chai.request(app)
            .del(`/api/folders/${folder.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);

          return Folder.findById(folder.id);
        })
        .then(res => {
          expect(res).to.not.exist;
        });
    });

    it('should set the `folderId` of all notes in the folder to null', function () {
      let folder;
      let notes;

      return Folder.findOne()
        .then(data => {
          folder = data;

          return Note.find({ folderId: folder.id });
        })
        .then(_notes => {
          notes = _notes;
          expect(notes.length).to.not.equal(0);

          return chai.request(app)
            .del(`/api/folders/${folder.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);

          return Promise.all([
            Note.countDocuments({ folderId: { $exists: false } }),
            Note.countDocuments({ folderId: folder.id })
          ]);
        })
        .then(([nullCount, folderCount]) => {
          expect(nullCount).to.equal(notes.length);
          expect(folderCount).to.equal(0);
        });
    });

    it('should respond with an error if given a bad id', function () {
      const updateData = {
        name: 'Folder updated by chai'
      };

      return chai.request(app)
        .put('/api/folders/999')
        .send(updateData)
        .then(res => {
          expect(res).to.throw;
        });
    });
  });
});