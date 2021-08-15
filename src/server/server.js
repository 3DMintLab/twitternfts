import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import env from 'dotenv';
import bb from 'express-busboy';
import { upload, blocks_latest, parameters } from './blockfrost.js';
import axios from 'axios'
import { authenticate, callback } from './twitter.js'

const app = express()

if (process.env.NODE_ENV !== 'production') {
    env.config();
}

bb.extend(app, {
  upload: true,
  path: process.cwd()+'/dist/uploads',
  allowedPath: /./
});

app.use(express.static(process.cwd()+"/dist/", { maxAge: "365d"}));
app.use(cors({origin: [
    'http://127.0.0.1',
    'http://localhost:8080'
  ]}));
  
// Configure CORS
app.use((req, res, next) => {
res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
);

res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
next();
});

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.post('/upload',         upload);
app.get('/blocks_latest',   blocks_latest);
app.get('/parameters',      parameters);
// feel free to add your API endpoints here
app.get('/oembed', (request, response) => {
  const url = request.query.url
  axios.get(`https://publish.twitter.com/oembed?url=${url}`, { headers: {
    'Content-Type': 'application/json',
  }}).then(function (res) {
    response.status(200).send(res.data);
  }).catch(function (error) {
    var data = error.response.data;
    response.status(500).send(data);
  })
})
app.get('/token',      authenticate);
app.get('/callback',      callback);

const PORT = process.env.PORT || 80
const server = app.listen(PORT, () => {
    console.log(`App listening to ${PORT}....`)
    console.log('Press Ctrl+C to quit.')
});