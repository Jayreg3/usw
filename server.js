const express = require("express");
const path = require("path");
require("cross-fetch/polyfill");

const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const host = "0.0.0.0";
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

var objects_ham;
var objects_wam;
var objects_na;
const HAM_API = "c2f10da0-b77e-11e8-a4d1-69890776a30b";
const WAM_API = "nU1c0CMd7XHRpdi8njZIrOKyx81gghK5vjE0OnZczN5m9Cxfo2n0ahVO93erAfxQ";



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
    const url_ham = `https://api.harvardartmuseums.org/object?apikey=${HAM_API}&keyword=${search.general_search}`;
    const url_wam = `http://api.thewalters.org/v1/objects.json?keyword=${search.general_search}&apikey=${WAM_API}`;
    const url_na = `https://catalog.archives.gov/api/v1/?rows=10&q=${search.general_search}&resultTypes=object`;
    
    const fetch_ham = fetch(url_ham)
        .then(response => response.json())
        .then(data => {
            return data.records;
        });
    const fetch_wam = fetch(url_wam)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                return {Items:[]};
            }
        })
        .then(data => {
            console.log(data);
            return data.Items;
        });
    const fetch_na = fetch(url_na)
        .then(response => response.json())
        .then(data => {
            return data.opaResponse.results.result;
        });
    const combined = Promise.all([fetch_ham, fetch_wam, fetch_na]).then((values)=>{
        console.log(values[1]);
        res.render("search2", { objects_ham: values[0], objects_wam: values[1], objects_na: values[2] });
    }) 
    //res.render("search2", { objects_na: objects_na, objects_wam: objects_wam, objects_ham: objects_ham });

});

app.get("/ham/:object_id", function(req, res) {
    const url = `https://api.harvardartmuseums.org/object/${
        req.params.object_id
    }?apikey=${HAM_API}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            res.render("object", {object: data});
        });
});

app.get("/wam/:object_id", function(req, res) {
    const url = `http://api.thewalters.org/v1/objects/${req.params.object_id}.json?&apikey=${WAM_API}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            res.render("object_wam", {object: data.Data});
        });
});


app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);
});