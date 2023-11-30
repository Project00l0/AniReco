const express = require('express')
const session  = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
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

// --------------------------------------------------------------------------------------


app.post("/search", (req, res) => {
  const aniTitle = req.body.usrinp;

  malScraper.getInfoFromName(aniTitle)
    .then((data) => {
      // Extract the desired information
      const { genres, score } = data;

      req.session.genres = genres;
      req.session.score = score;

      // Log or send the extracted information
      console.log("Genres:", genres);
      console.log("Score:", score);

      // Send a response with the extracted information
      // res.status(200).json({
      //   genres: genres,
      //   score: score
      // });
      res.redirect('/recommendations');
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});


app.get('/recommendations', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'html', 'Reco.html'));

    const sessGenre = req.session.genres || [];
    const genreCodes = convertGenresToCodes(sessGenre);
    // const sessScore = Number(req.session.score) || 0;

    // console.log("Debug - Search Criteria:", {
    //   maxResults: 10,
    //   term: 0,
    //   type: 0,
    //   status: 0,
    //   score: sessScore,
    //   genreType: 0,
    //   genres: genreCodes
    // });
    

    var type = 'anime';
    const searchResults = await search.search(type, {
        maxResults: 10,
        term: 0,
        type: 0,
        status: 0,
        score: 0,
        genreType: 0,
        genres: genreCodes
    });
    req.session.sessResults = searchResults;
    const sessRes = req.session.sessResults;
    console.log("DEBUG SESSION RESULTS:");
    console.log(sessRes);


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin":"*"
    })
    return res.redirect("/html/Main.html");
}).listen(3000);


console.log("Listening to Port 3000");