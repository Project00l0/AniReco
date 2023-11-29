const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const malScraper = require('mal-scraper');
const app = express();

app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))

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
//     genres: [8] // 8 corresponds to the Drama genre, adjust as needed
//   })
//     .then(console.log)
//     .catch(console.error);

app.post("/search", (req, res) => {
    const term = req.body.usrinp;
    const type = 'anime';
    search.search(term, {
        maxResults: 10, // Adjust as needed
        term: term,
        type: 0,
        status: 0,
        score: 0,
        producer: 0,
        rating: 0,
        startDate: {
          day: 12,
          month: 2,
          year: 1990
        },
        endDate: {
          day: 12,
          month: 2,
          year: 2015
        },
        genreType: 0, // 0 for include genre list
        genres: [0] // 8 corresponds to the Drama genre, adjust as needed
      })
        .then(console.log)
        .catch(console.error);
});















app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin":"*"
    })
    return res.redirect("/html/Main.html");
}).listen(3000);


console.log("Listening to Port 3000");