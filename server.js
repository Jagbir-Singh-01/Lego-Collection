/*********************************************************************************
*  WEB322 – Assignment 4
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Jagbir Singh Student ID: 144019221 Date: 22-03-2024
*
********************************************************************************/

const express = require('express');
const clientSessions = require('client-sessions'); 
const path = require('path');
const legoData = require("./modules/legoSets"); 
const authData = require('./modules/auth-service.js');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');

app.use(clientSessions({
  cookieName: 'session',
  secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr',
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 1000 * 60 * 5
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const ensureLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
      res.redirect('/login');
  } else {
      next();
  }
};

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    res.render("about");
});
  
  app.get('/lego/addSet', async (req, res) => {
    let themes = await legoData.getAllThemes();
    res.render('addSet', { themes: themes });
  });

  app.get('/lego/addSet', ensureLogin, (req, res) => {
    Theme.find()
        .then((themes) => {
            res.render('addSet', { 
                themes: themes, 
                user: req.session.user
            });
        })
        .catch((err) => {
            console.error('Error fetching themes:', err);
            res.redirect('/lego/sets?error=Unable to fetch themes');
        });
});

  app.get('/lego/editSet/:num', async (req, res) => {
  
    try {
      let set = await legoData.getSetByNum(req.params.num);
      let themes = await legoData.getAllThemes();
  
      res.render("editSet", { set, themes });
    } catch (err) {
      res.status(404).render("404", { message: err });
    }
  });

  app.post("/lego/editSet", async (req, res) => {
  
    try {
      await legoData.editSet(req.body.set_num, req.body);
      res.redirect("/lego/sets");
    } catch (err) {
      res.render("500", { message: `I'am sorry, but we have encountered the following error ${err}` });
    }
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

app.get('/lego/deleteSet/:num', async (req, res) => {
  try {
      await legoData.deleteSet(req.params.num);
      res.redirect('/lego/sets');
  } catch (err) {
      res.status(500).render('500', { message: `Error deleting set: ${err}` });
  } 
});

app.get("/login", function(req, res) {
  res.render("login", { 
    errorMessage: ""
  });
});

app.get("/register", function(req, res) { 
  res.render('register', { 
    errorMessage: "",
    successMessage: ""
  });
});

app.post('/register', (req, res) => {
  authData.registerUser(req.body)
      .then(() => {
          res.render('register', { successMessage: "User created" });
      })
      .catch((err) => {
          res.render('register', { errorMessage: err, userName: req.body.userName }); 
      });
});

 app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
      .then((user) => {
          req.session.user = {
              userName: user.userName, 
              email: user.email, 
              loginHistory: user.loginHistory
          };
          res.redirect('/lego/sets'); 
      })
      .catch((err) => res.render('login', { errorMessage: err, userName: req.body.userName }));
});

app.get('/logout', (req, res) => {
    req.session.reset(); 
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory', { user: req.session.user });
});

app.use((req, res) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(HTTP_PORT, () => { 
            console.log(`app listening on: ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.log(`unable to start server: ${err}`);
    });