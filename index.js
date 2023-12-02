const express = require('express')
const session  = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const ejs = require('ejs');
const malScraper = require('mal-scraper');
const axios = require('axios');
const app = express();
const path = require('path'); 

app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.use(session({
  secret: 'gensco', // Change this to a secure, random value
  resave: false,
  saveUninitialized: true
}));

const search = malScraper.search
// API KEY FOR KITSU
// const apiKey = 'https://kitsu.io/api/edge';
// const imgSearch = 'Naruto';
// const apiUrl = `https://kitsu.io/api/edge/anime/${imgSearch}`;

// const headers = {
//   'Authorization': `Bearer ${apiKey}`,
// };

// axios.get(apiUrl, { headers })
//   .then(response => {
//     // Handle the successful response
//     console.log(response.data);
//   })
//   .catch(error => {
//     // Handle errors
//     console.error('KITSU Error:', error.message);
//   });


// const type = 'anime'

// console.log(search.helpers);

// search.search(type, {
//     maxResults: 10, // Adjust as needed
//     term: 0,
//     type: 0,
//     status: 0,
//     score: 0,
//     producer: 0,
//     rating: 0,
//     startDate: {
//       day: 12,
//       month: 2,
//       year: 1990
//     },
//     endDate: {
//       day: 12,
//       month: 2,
//       year: 2015
//     },
//     genreType: 0, // 0 for include genre list
//     genres: [1, 4, 8] // 8 corresponds to the Drama genre, adjust as needed
//   })
//     .then(console.log)
//     .catch(console.error);




// FUNCTIONS ----------------------------------------------------------------
function convertGenresToCodes(sessGenre) {
  const genreMapping = {
    'Action': 1,
    'Adventure': 2,
    'Comedy': 4,
    'Drama': 8,
    'Ecchi': 9,
    'Fantasy': 10,
    'Game': 11,
    'Harem': 13,
    'Horror': 14,
    'Mecha': 18,
    'Music': 19,
    'Mystery': 7,
    'Psychological': 40,
    'Romance': 22,
    'Sci-Fi': 24,
    'Slice of Life': 36,
    'Sports': 30,
    'Supernatural': 37,
    'Thriller': 41
  };

  // Use map to convert each genre name to its corresponding code
  const genreCodes = sessGenre.map(genre => genreMapping[genre]);

  return genreCodes;
}


function createAnimeCard(animeData) {
  // Create the main div
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('box');

  // Create the anchor element
  const anchorElement = document.createElement('a');
  anchorElement.href = animeData.url;
  anchorElement.target = '_blank';

  // Create the image element
  const imgElement = document.createElement('img');
  imgElement.src = animeData.thumbnail;

  // Create the heading element
  const headingElement = document.createElement('h1');
  headingElement.textContent = animeData.title;

  // Create the below div
  const belowDiv = document.createElement('div');
  belowDiv.id = 'below';

  // Create paragraphs for score and episodes
  const scoreParagraph = document.createElement('p');
  scoreParagraph.textContent = `Score: ${animeData.score}`;

  const episodesParagraph = document.createElement('p');
  episodesParagraph.textContent = `Episodes: ${animeData.nbEps}`;

  // Append elements to their respective parents
  cardDiv.appendChild(anchorElement);
  anchorElement.appendChild(imgElement);
  anchorElement.appendChild(headingElement);
  anchorElement.appendChild(belowDiv);
  belowDiv.appendChild(scoreParagraph);
  belowDiv.appendChild(episodesParagraph);

  // Return the created HTML structure
  return cardDiv;
}

// --------------------------------------------------------------------------------------


app.post("/search", (req, res) => {
  const aniTitle = req.body.usrinp;
  // TO CLEAR DATA FROM PAST RESULSTS
  req.session.sessResults = null;
  req.session.sessRes = null;
  req.session.sessGenre = null;

  malScraper.getInfoFromName(aniTitle)
    .then((data) => {
      // Extract the desired information
      const { genres } = data;

      req.session.genres = genres;

      // Log or send the extracted information
      console.log("Genres:", genres);

      // Send a response with the extracted information
      // res.status(200).json({
      //   genres: genres,
      // });
      res.redirect('/recommendations');
    })
    .catch((err) => {
      console.log(err);
    });
});


app.get('/recommendations', async (req, res) => {
  const filePath = path.join(__dirname, 'public', 'html', 'Reco.html');

  try {
    const sessGenre = req.session.genres || [];
    const genreCodes = convertGenresToCodes(sessGenre);
    const type = 'anime';

    const searchResults = await search.search(type, {
      maxResults: 10,
      term: 0,
      type: 0,
      status: 0,
      score: 0,
      genreType: 0,
      genres: genreCodes,
    });

    req.session.sessResults = searchResults;
    const sessRes = req.session.sessResults;
    console.log(sessRes);

    const divs = sessRes.map((data) => `
    <div id="mdl">
      <a href="#" target="_blank">
        <img src="${data.thumbnail}" />
        <h1>${data.title}</h1>
        <div id="below">
          <p>Score: ${data.score}</p>
          <p>Episodes: ${data.nbEps}</p>
        </div>
      </a>
    </div>
  `);
  
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const updatedHTML = data.replace('<div id="nothing">', `<div id="resCon">\n${divs.join('\n')}\n`);
      res.send(updatedHTML);
    });
  } catch (error) {
    console.error(error);
  }
});



app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin":"*"
    })
    return res.redirect("/html/Main.html");
}).listen(3000);


console.log("Listening to Port 3000");