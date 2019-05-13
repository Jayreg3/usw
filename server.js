const express = require("express");
const path = require("path");
require("cross-fetch/polyfill");

const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const host = "127.0.0.1";
const port = 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

var objects_ham;
var objects_wiki;
var objects_na;
const API_KEY = "c2f10da0-b77e-11e8-a4d1-69890776a30b";


// behavior for the index route
app.get("/", (req, res) => {
    res.render("index");
});

//behavior for the search route, get method used to allow users to bookmark and return to a search
app.get("/search", function(req,res){
    var search2 = {
        general_search : req.query.general_search,
        /*title : req.query.title,
        description : req.query.description,
        location : req.query.location,
        nasa_center : req.query.nasa_center,
        year_start : req.query.year_start,
        year_end : req.query.year_end*/
    }
    var url;
    if (search.year_start && search.year_end){
        url = `https://images-api.nasa.gov/search?q=${search.general_search}&title=${search.title}&description=${search.description}&location=${search.location}&center=${search.nasa_center}&year_start=${search.year_start}&year_end=${search.year_end}`;
    }
    else if (search.year_end){
        url = `https://images-api.nasa.gov/search?q=${search.general_search}&title=${search.title}&description=${search.description}&location=${search.location}&center=${search.nasa_center}&year_end=${search.year_end}`; 
    }
    else if (search.year_start){
        url = `https://images-api.nasa.gov/search?q=${search.general_search}&title=${search.title}&description=${search.description}&location=${search.location}&center=${search.nasa_center}&year_start=${search.year_start}`;
    }
    else {
        url = `https://images-api.nasa.gov/search?q=${search.general_search}&title=${search.title}&description=${search.description}&location=${search.location}&center=${search.nasa_center}`;
    }
    fetch(url)
        .then(response => response.json())
        .then(data => {
           res.render("search",{userValue : search, nasa :data});
        });
});

app.get("/search2", function(req, res){
    var search = {
        general_search : req.query.general_search/*,
        title : req.query.title,
        description : req.query.description,
        location : req.query.location,
        nasa_center : req.query.nasa_center,
        year_start : req.query.year_start,
        year_end : req.query.year_end*/
    }
    const url_ham = `https://api.harvardartmuseums.org/object?apikey=${API_KEY}&keyword=${search.general_search}`;
    const url_wiki = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=allimages&aifrom=${search.general_search}&ailimit=100`;
    const url_na = `https://catalog.archives.gov/api/v1/?rows=10&q=${search.general_search}&resultTypes=object`;
    
    fetch(url_ham)
        .then(response => response.json())
        .then(data => {
            objects_ham = data.records;
        });
    fetch(url_wiki)
        .then(response => response.json())
        .then(data => {
            objects_wiki = data.query.allimages;
        });
    fetch(url_na)
        .then(response => response.json())
        .then(data => {
            objects_na = data.opaResponse.results.result;
            res.render("search2", { objects_na: objects_na, objects_wiki: objects_wiki, objects_ham: objects_ham });
        });
});

app.get("/ham/:object_id", function(req, res) {
    const url = `https://api.harvardartmuseums.org/object/${
        req.params.object_id
    }?apikey=${API_KEY}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            res.render("object", {object: data});
        });
});


app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);
});