var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// db.Article.collection.drop();
// db.Note.collection.drop();


var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();



// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.wdwmagic.com/news.htm").then(function (response) {
    // Then, we load that into n and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);


    // Now, we grab every h2 within an article tag, and do the following:
    $("div[id^='Body_RepeaterNewsPrimary_Panel_SmallNews_']").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      var h3Tag = $(this)
        .find("h3");
        
      var imgSrc = $(this).find("img").data("original").split(';')[0];
      result.img = imgSrc;

      var pTag = h3Tag.next("p");
      result.summary = pTag.text();

      var aTag = h3Tag.children("a");

      result.headline = aTag.text();
      result.url = "https://www.wdwmagic.com" + aTag.attr("href");


      db.Article.findOne({ url: result.url }, function (err, article) {
        if (err || !article) {
          // // Create a new Article using the `result` object built from scraping
          db.Article.create(result)
            .then(function (dbArticle) {
              // View the added result in the console
              console.log(dbArticle);
            })
            .catch(function (err) {
              // If an error occurred, log it
              console.log(err);
            });
        }

      });


      console.log(result);
       // Send a message to the client
      res.json("success");
    });
  });
});




app.get("/", function (req, res) {
  db.Article.find({}).then(function (articles) {
    console.log(articles);
    return res.render("index",
      { articles: articles }
    );
  }).catch(function (err) {
    return res.json(err);
  })


});


app.post("/createNote/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findByIdAndUpdate(req.params.id, { $push: { note: dbNote} }, { new: true, safe: true, upsert: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/deleteNote/:id", function(req, res) {
  db.Note.findById(req.params.id).remove(function (err) {
    return res.json(err);
  });    
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/notes/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});




// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
