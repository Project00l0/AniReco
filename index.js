const express = require('express')
const session  = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const malScraper = require('mal-scraper');
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

const compareByScore = (anime1, anime2) => {
  const score1 = parseFloat(anime1.score);
  const score2 = parseFloat(anime2.score);

  // Sort in descending order
  return score2 - score1;
};


// --------------------------------------------------------------------------------------


app.post("/search", (req, res) => {
  const aniTitle = req.body.usrinp;
  // TO CLEAR DATA FROM PAST RESULSTS
  req.session.sessResults = null;
  req.session.sessRes = null;
  req.session.sessGenre = null;
  req.session.scoreMax = 9; 
  req.session.scoreMin = 8;

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

app.post("/searchManga", (req, res) => {
  const aniTitle = req.body.usrinp;
  // TO CLEAR DATA FROM PAST RESULSTS
  req.session.sessResults = null;
  req.session.sessRes = null;
  req.session.sessGenre = null;
  req.session.scoreMax = 9; 
  req.session.scoreMin = 8;

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
      res.redirect('/Manga_recommendations');
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/Manga_recommendations', async (req, res) => {
  const filePath = path.join(__dirname, 'public', 'html', 'Reco.html');

  try {
    const sessGenre = req.session.genres || [];
    const genreCodes = convertGenresToCodes(sessGenre);
    const type = 'manga';
    const Max = req.session.scoreMax;
    const Min = req.session.scoreMin;

    const searchResults = await search.search(type, {
      maxResults: 10,
      term: 0,
      type: 0,
      status: 0,
      score: (Max, Min),
      genreType: 0,
      genres: genreCodes,
    });

    req.session.sessResults = searchResults;
    const sessRes = req.session.sessResults;
    console.log(sessRes);
    const sortedResData = sessRes.sort(compareByScore);

    const divs = sortedResData.map((data) => `
    <div id="mdl">
      <div id="lef">
        <a href="${data.url} target="_blank">
          <img src="${data.thumbnail}" />
        </a> 
      </div>
      <a href="${data.url}" target="_blank">
        <h1>${data.title}</h1>
        <p>Type: ${data.type}</p>
        <p>Score: ${data.score || "Not yet added"}</p>
        <p>Chapters: ${data.nbChapters || "Not yet added"}</p>
        <p>Volumes:  ${data.vols || "Not yet added"}</p>
        <div id="synop">
          <p>Synopsis: ${data.shortDescription || "No synopsis added yet"}</p>
        </div>
      </a>
    </div>
  `);
  const nextBtnHtml = (Max === 5 && Min === 4) ? '' : '<a href="/nextMangaPage" id="nextPage">Next Page<span class="material-symbols-outlined">navigate_next</span></a>';
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const updatedHTML = data.replace('<div id="nothing">', `<div id="resCon">\n${divs.join('\n')}\n</div>\n${nextBtnHtml}`);
      res.send(updatedHTML);
    });
    console.log("TEST", Max, Min);
  } catch (error) {
    console.error(error);
  }
});

app.get('/nextMangaPage', async (req, res) => {
  try {
    // Subtract 2 from each element of scoreMax and scoreMin, but ensure they don't go below 0
    req.session.scoreMax = Math.max(req.session.scoreMax - 2, 5);
    req.session.scoreMin = Math.max(req.session.scoreMin - 2, 4);
    // Redirect to the recommendations route to perform a new search
    res.redirect('/Manga_recommendations');
  } catch (error) {
    console.error(error);
  }
});




app.get('/recommendations', async (req, res) => {
  const filePath = path.join(__dirname, 'public', 'html', 'Reco.html');

  try {
    const sessGenre = req.session.genres || [];
    const genreCodes = convertGenresToCodes(sessGenre);
    const type = 'anime';
    const Max = req.session.scoreMax;
    const Min = req.session.scoreMin;

    const searchResults = await search.search(type, {
      maxResults: 10,
      term: 0,
      type: 0,
      status: 0,  
      score: (Max, Min),
      genreType: 0,
      genres: genreCodes,
    });

    req.session.sessResults = searchResults;
    const sessRes = req.session.sessResults;
    console.log(sessRes);
    const sortedResData = sessRes.sort(compareByScore);

    const divs = sortedResData.map((data) => `
    <div id="mdl">
      <div id="lef">
        <a href="${data.url} target="_blank">
          <img src="${data.thumbnail}" />
        </a> 
      </div>
      <a href="${data.url}" target="_blank">
        <h1>${data.title}</h1>
        <p>Type: ${data.type}</p>
        <p>Score: ${data.score}</p>
        <p>Episodes: ${data.nbEps}</p>
        <p>Rating:  ${data.rating}</p>
        <div id="synop">
          <p>Synopsis: ${data.shortDescription || "No synopsis added yet"}</p>
        </div>
      </a>
    </div>
  `);
  const nextBtnHtml = (Max === 5 && Min === 4) ? '' : '<a href="/nextAniPage" id="nextPage">Next Page<span class="material-symbols-outlined">navigate_next</span></a>';
  
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const updatedHTML = data.replace('<div id="nothing">', `<div id="resCon">\n${divs.join('\n')}\n</div>\n${nextBtnHtml}`);
      res.send(updatedHTML);
    });
    
    console.log("TEST", Max, Min);
  } catch (error) {
    console.error(error);
  }
});

app.get('/nextAniPage', async (req, res) => {
  try {
    // Subtract 2 from each element of scoreMax and scoreMin, but ensure they don't go below 0
    req.session.scoreMax = Math.max(req.session.scoreMax - 2, 5);
    req.session.scoreMin = Math.max(req.session.scoreMin - 2, 4);
    // Redirect to the recommendations route to perform a new search
    res.redirect('/recommendations');
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