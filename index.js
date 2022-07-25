const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const config= require('config');

const app = express();  
const port = config.get("PORT")
// Middleware
app.use(bodyParser.json());

// Mongo URI
const mongoURI = config.get("MONGO_URI");
console.log({mongoURI})
let dbInstance= mongoose.connect(process.env.MONGO_URI || config.get("MONGO_URI"),
{
  auth: {
    username: config.get("MONGO_USERNAME"),
    password: config.get("MONGO_PASSWORD"),
  },
  authSource: "admin",
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
// let bucket;
let conn = mongoose.connection;
// Init gfs
let gfs;
conn.on('error', console.error.bind(console, 'connection error'));
conn.once('open', () => {
  // Init stream
  console.log("connected")
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {bucketName: 'uploads'})
  gfs = Grid(conn.db, mongoose.mongo);  
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  db: dbInstance,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
    });
  }
});

const upload = multer({ storage})

app.post('/upload', upload.single('file'), (req, res) => {
    console.log("/upload/");
    res.status(200)
    let response = {}
    response.success = true;
    response.message = `upload file Success`;
    response.result = req.file.originalname
    res.send(response)
  });
app.get('/file/:filename', (req, res)=> {
    console.log("/file/");
    gfs.files.find({filename: req.params.filename}).toArray(function (err, file) {
        if (!file[0] || file.length[0] == 0) {
            return res.status(404).json({
                responseCode: 404,
                responseMessage: req.params.filename + " FILE NOT FOUND"
            });
        }
        // create read stream
        res.status(200)
        let response = {}
        response.success = true;
        response.message = `read file Success`;
        response.result = file[0]
        res.send(response)
    })
})
app.get('/file/download/:filename', (req, res)=> {
    console.log("/file/download");
    gfs.files.find({filename: req.params.filename}).toArray(function (err, file) {
        if (!file[0] || file[0].length== 0) {
            return res.status(404).json({
                responseCode: 404,
                responseMessage: req.params.filename + " FILE NOT FOUND"
            });
        }
        // create read stream
        let readstream = gridfsBucket.openDownloadStream(file[0]._id)
    
        // Return response
        return readstream.pipe(res);
    })
})
app.post('/delete/file/:filename', (req, res) => {
  console.log("/delete/")
  gfs.files.find({filename: req.params.filename}).toArray(function (err, file) {
    if (!file || file.length == 0) {
      return res.status(404).json({
        responseCode: 404,
        responseMessage: req.params.filename + " FILE NOT FOUND"
      });
    }
    try {
      const obj_id = new mongoose.Types.ObjectId(file[0]._id);
      gridfsBucket.delete( obj_id );
      res.status(200)
      let response = {}
      response.success = true;
      response.message = `Delete Success`;
      response.result = req.params.filename
      res.send(response)
    } catch (error) {
      console.log({ error })
      res.status(400)
      let response = {}
      response.success = false;
      response.message = `Delete Failed`;
      response.result = null
      response.error_code = error
      res.send(response)
    }
  })
})
  app.listen(`${port}`,function () {
    console.log("Server Started at PORT 3000");
})
