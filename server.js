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

var PORT = 3000;

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
app.get("/", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.wdwmagic.com/news.htm").then(function(response) {
    // Then, we load that into n and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    var results = [];

    // Now, we grab every h2 within an article tag, and do the following:
    $("div[id^='Body_RepeaterNewsPrimary_Panel_SmallNews_']").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      var h3Tag = $(this)
        .find("h3")

      var pTag = h3Tag.next("p");
      result.summary = pTag.text();

      var aTag = h3Tag.children("a");
   
      result.title = aTag.text();
      result.link = "https://www.wdwmagic.com"  + aTag.attr("href");

      // // Create a new Article using the `result` object built from scraping
      // db.Article.create(result)
      //   .then(function(dbArticle) {
      //     // View the added result in the console
      //     console.log(dbArticle);
      //   })
      //   .catch(function(err) {
      //     // If an error occurred, log it
      //     console.log(err);
      //   });

      results.push(result);
      console.log(result);
    });

    // Send a message to the client
    res.render("index", 
    { articles: results}
    );
  });
});












// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
