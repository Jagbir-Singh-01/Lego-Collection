/*********************************************************************************
*  WEB322 – Assignment 3
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Jagbir Singh Student ID: 144019221 Date: 19-02-2024
*
********************************************************************************/

const express = require('express');
const path = require('path');
const legoData = require("./modules/legoSets"); 
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/lego/sets', (req, res) => {
  const theme = req.query.theme;

  if (theme) {
      legoData.getSetsByTheme(theme)
          .then((data) => {
              res.render('sets', { sets: data });
          })
          .catch((err) => {
              res.status(404).send(`404 - Sets Not Found: ${err}`); 
          });
  } else {
      legoData.getAllSets()
          .then((data) => {
              res.render('sets', { sets: data });
          })
          .catch((err) => {
              res.status(404).send(`404 - Sets Not Found: ${err}`);
          });
  }
});
  
  
app.get('/lego/sets/:id', (req, res) => {
  const setNum = req.params.id;

  legoData.getSetByNum(setNum)
      .then((data) => {
          res.render('set', { set: data });
      })
      .catch((err) => {
          res.status(404).send(`404 - Set Not Found: ${err}`); 
      });
});
  
  
  app.use((req, res) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
  });
  
  
  legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
  }).catch((err) => {
    console.log(err);
  });