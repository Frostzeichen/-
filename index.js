//PRELOADING
//express
const express = require("express");
const app = express();

//http
const http = require("http");
const server = http.createServer(app);

//pug
const pug = require("pug");
app.set("views", "./views");
app.set("view engine", "pug");

//bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//faunadb
const faunadb = require("faunadb")
const q = faunadb.query;
const serverClient = new faunadb.Client({ secret: 'fnAEofWWaaACVJTEs0sSlcgu81glkeT3D-K2qDcj' });
// fnAEofWWaaACVJTEs0sSlcgu81glkeT3D-K2qDcj　六十四式

//SERVER
//faunadb
// Storage for list of titles.
let articleTitles = [];

// Gathers a list of titles.
serverClient.query(q.Map(
  q.Paginate(q.Match(q.Index("is_article"), true)),
  q.Lambda((article) => q.Get(article))
))
.then((ret) => {
  let gatheredArticleTitles = ret.data.map(
    (article) => article.data
  );
  for (let i = 0; i < Object.keys(gatheredArticleTitles).length; i++){
    articleTitles.push({
      title: gatheredArticleTitles[i].title,
      author: gatheredArticleTitles[i].author,
      content: gatheredArticleTitles[i].content
    })
  }
})

//app.get
app.get("/article/:title", (req, res) => {
  let queryArticle = articleTitles.find(att => att.title === req.params.title)
  res.render("viewer.pug", {title: queryArticle.title, author: queryArticle.author, content: queryArticle.content})
  req.params = []
});

app.get("/writer", (req, res) => {
  res.render("writer.pug")
});

app.get("/", (req, res) => {
  res.render("template.pug", {title: articleTitles})
});

app.post("/newArticle", (req,res) => {
  let newArticle = req.body
  let dateVal = new Date()
  newArticle.date = {
    day: dateVal.getDate(),
    month: dateVal.getMonth() + 1,
    year: dateVal.getFullYear()
  }
  newArticle.is_article = true
  serverClient.query(q.Create(
    q.Collection("articles"),
    {data: newArticle}
  ))
  .then((ret) => {
    toArticleTitles = [{title: newArticle.title, author: newArticle.author, content: newArticle.content}]
    articleTitles.push(toArticleTitles[0])
  })
});

//app.use
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//server info
const port = 8080;
const appName = "六十四式 || Experimental App";
const version = "version 0.1.0";
server.listen(port, (error) => {
  if(error){
    console.error(error);
  } else {
    console.log(appName + " " + version);
    console.log("Listening! @ port " + port);
  };
});