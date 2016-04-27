// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server).of('/chat');
//var io2 = require('socket.io').listen(server).of('/spin');
var morgan     = require('morgan');
var path = require('path');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var MongoClient = require('mongodb').MongoClient
var db;
var steamApiKey = '336F47CADE44154B12B320F6F6B4AA02';
var backpackApiKey = '56f5373dc440454b3b63a179';
var marketPrices;
var urls=[];
var allClients=[];
var currentTimeVideo = 0;

/******************************************************
                  Configuration
*******************************************************/

// configure app
app.set('views', __dirname + '/views');
app.use(morgan('dev')); // log requests to the console

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'cat',
    resave: false,
    saveUninitialized: false
}));

var port     = process.env.PORT || 8080; // set our port

/*var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/csgo'); // connect to our database*/
var Bear = require('./app/models/bear');
//var Playlist = require('./app/models/playlist');


/******************************************************
                  Steam Passport
*******************************************************/

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var dev = 'http://localhost:8080/';
var prod = 'https://csgo-fun.herokuapp.com/'
// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:8080/auth/steam/return',
    realm: 'http://localhost:8080/',
    apiKey: '336F47CADE44154B12B320F6F6B4AA02'
  },
  function(identifier, profile, done) {
  	console.log("retour de steam");
  	//console.log(profile);
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));


/**********************************************************
                  ROUTES FOR OUR API 
***********************************************************/

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening in router.');
  next();
});

router.post('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/login');
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' }); 
});

/**
 * @api {get} api/stat/:id Stats csgo's player
 * @apiName StatsPlayer
 * @apiGroup API
 * @apiDescription Retrieve stats of a player.
 *
 * @apiParam {Number} id Steam ID.
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
router.get('/stat', function(req, res){
  http.get('http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key='+steamApiKey+'&steamid='+req.query.id, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            res.json(parsed);
        });
    });
});

/**
 * @api {get} api/community Actualities csgo community
 * @apiName Actualities community
 * @apiGroup API
 * @apiDescription Retrieve actualities of the csgo community.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
router.get('/community', function(req, res){
  http.get('http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=730&count=20&maxlength=300&format=json', function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            res.json(parsed);
        });
    });
});

/**
 * @api {get} api/getProfile Steam profile
 * @apiName Steam profile
 * @apiGroup API
 * @apiDescription Retrieve steam profile.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
router.get('/getProfile', function(req, res){
  http.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key='+steamApiKey+'&steamids='+req.query.id, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(body);
            res.json(parsed);
        });
    });
});

/**
 * @api {get} api/inventory/:id Inventory csgo
 * @apiName Inventory csgo
 * @apiGroup API
 * @apiDescription Retrieve csgo inventory.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
router.get('/inventory', function(req, res){
  http.get('http://steamcommunity.com/profiles/'+req.query.id+'/inventory/json/730/2', function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            res.json(parsed);
        });
    });
});

/**
 * @api {get} api/steamid Session
 * @apiName Session
 * @apiGroup API
 * @apiDescription Return steamid and passport.
 *
 * @apiSuccess {Object} cookie The user's cookie.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     "cookie": {
 *      "originalMaxAge": null,
 *      "expires": null,
 *      "httpOnly": true,
 *      "path": "/"
 *      }
 *     }
 */
router.get('/steamid', function(req, res){
  res.json(req.session);
});

/**
 * @api {get} api/marketprice Marketplace csgo
 * @apiName Marketplace csgo
 * @apiGroup API
 * @apiDescription Retrieve csgo market prices.
 *
 * @apiSuccess {Object} response Response marketplace.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     "response": {
 *         "success": 1,
 *         "current_time": 1460714739,
 *         "items": {
 *            "AK-47 | Aquamarine Revenge (Battle-Scarred)": {
 *            "last_updated": 1460703622,
 *            "quantity": 81,
 *            "value": 1097
 *          },
 *         "AK-47 | Aquamarine Revenge (Factory New)": {
 *            "last_updated": 1460703622,
 *            "quantity": 48,
 *            "value": 4100
 *          },
 *          "AK-47 | Aquamarine Revenge (Field-Tested)": {
 *            "last_updated": 1460703622,
 *            "quantity": 127,
 *            "value": 2038
 *          },
 *          "AK-47 | Aquamarine Revenge (Minimal Wear)": {
 *            "last_updated": 1460703622,
 *            "quantity": 68,
 *            "value": 3051
 *          },
 *          ...
 *      }
 *    }
 */
router.get('/marketprice', function(req, res){
  res.json(marketPrices);
});

/******************************************************
                ROUTES FOR OUR VIEWS
******************************************************/

var routerView = express.Router();

// middleware to use for all requests
routerView.use(function(req, res, next) {
	// do logging
	console.log('Something is happening in routerView.');
	next();
});

routerView.get('/', function(req, res){
	res.sendfile(path.join(__dirname+'/views/layout.html'));
});

routerView.get('/test', function(req, res){
	res.sendfile(path.join(__dirname+'/views/test.html'));
});

app.get('/login', function(req, res){
	res.sendfile(path.join(__dirname+'/views/login.html'));
});

app.get('/404', function(req, res){
	res.sendfile(path.join(__dirname+'/views/404.html'));
});

app.get('/500', function(req, res){
	res.sendfile(path.join(__dirname+'/views/500.html'));
});


/*****************************************************************
                      Demo API CRUD
*****************************************************************/

// on routes that end in /bears
// ----------------------------------------------------
router.route('/bears')

	// create a bear (accessed at POST http://localhost:8080/bears)
	.post(function(req, res) {
		
		var bear = new Bear();		// create a new instance of the Bear model
		bear.name = req.query.name;
		console.log(req.params);
		console.log(req.query);
		console.log(bear.name);  // set the bears name (comes from the request)

		bear.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Bear created!' });
		});

		
	})

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		Bear.find(function(err, bears) {
			if (err)
				res.send(err);

			res.json(bears);
		});
	});

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/bears/:bear_id')

	// get the bear with that id
	.get(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {
			if (err)
				res.send(err);
			res.json(bear);
		});
	})

	// update the bear with this id
	.put(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {

			if (err)
				res.send(err);

			bear.name = req.body.name;
			bear.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Bear updated!' });
			});

		});
	})

	// delete the bear with this id
	.delete(function(req, res) {
		Bear.remove({
			_id: req.params.bear_id
		}, function(err, bear) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});


/******************************************************************
                  Chat and Urls Websockets
******************************************************************/

io.on('connection', function(socket){
  console.log("client connected to the server !");
  //user send his username
  socket.on('user', function(id, username, photo){
    console.log(username+' connected to the chat !');
    var item = {
      'socket': socket,
      'id': id
    };
    var alreadyConnected = false;
    allClients.some(function name(element, index, array){
      if(element.id==item.id){
        alreadyConnected=true;
        return true;
      }
    });
    if(!alreadyConnected){
      allClients.push(item);
    }
    if(urls.length>0){
      socket.emit('join', id, username, ' is connecting to the chat !', photo, urls, Date.now(), allClients.length, currentTimeVideo);
    }
    else{
      socket.emit('join', id, username, ' is connecting to the chat !', photo, urls, Date.now(), allClients.length, currentTimeVideo);
    }
    socket.broadcast.emit('otherJoin', allClients.length);
  });

  socket.on('disconnect', function(){
      var id;
      allClients.some(function name(element, index, array){
        if(element.socket==socket){
          urls.some(function name2(element2, index2, array2){
            if(element.id==element2.id){
              urls.splice(index2, 1);
              return true;
            }
          });
          id=element.id;
          allClients.splice(index, 1);
          return true
        }
      });
      socket.broadcast.emit('bye', id, allClients.length);
  });

  socket.on('setCurrentTime', function(time){
    currentTimeVideo = time;
  });

  socket.on('writeVote', function(id, username, vote){
    if(username&&id){
      socket.broadcast.emit('vote', id, username, vote, Date.now());
    }
  });

  socket.on('writeUrl', function(id, username, title, url, photo, thumbnail){
    if(id&&username&&url){
      var item = {
        id: id,
        username: username,
        title: title,
        url: url,
        photo: photo,
        thumbnail: thumbnail,
        time: Date.now()
      };
      urls.push(item);
      socket.broadcast.emit('addUrl', id, username, title, url, photo, thumbnail, Date.now());
    }
  });

  socket.on('playVideo', function(id, username, title, url, photo, thumbnail){
    if(urls[0].id=id){
      socket.broadcast.emit('receivePlayVideo', urls[0].id, urls[0].username, urls[0].title, urls[0].url, urls[0].photo, urls[0].thumbnail);
    }
  });

  socket.on('deleteUrl', function(id, username, title, url, photo, thumbnail){
    //console.log('dans deleteUrl');
    if(urls.length>0&&urls[0].id==id&&urls[0].url==url){
      urls.shift();
      //console.log('urls');
      socket.broadcast.emit('removeUrl', id, username, title, url, photo, thumbnail);
      //console.log('on envoie removeUrl');
    }
  });

  socket.on('writeMessage', function(id, username, message, photo){
    if(username){
      socket.broadcast.emit('message', id, username, message, photo, Date.now());
    }
    else{
      socket.emit('error', 'Username is not set yet');
    }
  });
});

/////////////////////////////////////////////////////////////////////////

router.route('/songs')

  .post(function(req, res){
      console.log("dans POST /songs");
      if(req.query.playlistid&&req.query.title&&req.query.url&&req.query.thumbnail){
        console.log('on save');
        db.collection('songs').save({'playlistid': req.query.playlistid, 'title': req.query.title, 'url':req.query.url, 'thumbnail': req.query.thumbnail}, (err, result) => {
          if(err){
            console.log(err);
          } 
          else{
              console.log(result.ops);
              return res.json(result.ops);
          }
        })
      } 
  })

  .get(function(req, res){
    console.log("dans GET /songs");
    if(req.query.playlistid){
      console.log(req.query.playlistid);
      db.collection('songs').find({'playlistid': req.query.playlistid}).toArray(function(err, results) {
        if(err){
          console.log(err);
        }
        else{
          return res.json(results)
        }
        // send HTML file populated with quotes here
      })
    }
  })

  .delete(function(req, res){
    console.log("dans DELETE /songs");
    if(req.query.id){
      db.collection('songs').remove({'_id': req.query.id}, (err, result) => {
        if(err){
          console.log(err);
        }
        else{
          console.log(result);
          return res.json(result);
        }
      })
    }
  })


router.route('/playlists')

  .post(function(req, res){
      console.log("dans POST /playlists");
      if(req.query.steamid&&req.query.name){
        db.collection('playlists').save({'steamid': req.query.steamid, 'name': req.query.name}, (err, result) => {
          if(err){
            console.log(err);
          } 
          else{
              console.log(result.ops);
              return res.json(result.ops);
          }
        })
      } 
  })

  .get(function(req, res){
    console.log("dans GET /playlists");
    if(req.query.steamid){
      console.log(req.query.steamid);
      db.collection('playlists').find({'steamid': req.query.steamid}).toArray(function(err, results) {
        if(err){
          console.log(err);
        }
        else{
          return res.json(results)
        }
        // send HTML file populated with quotes here
      })
    }
  })

  .put(function(req, res){
    console.log("dans PUT /playlists");
    //console.log(req.query);
    if(req.query._id&&req.query.steamid&&req.query.items){
      var array = JSON.parse("["+req.query.items+"]");
      console.log(array);
      db.collection('playlists').updateOne({_id:req.query._id}, {$set: {items:array}}, function(err, playlist){
        if(err){
          console.log(err);
        }
        else{
          console.log(playlist);
        }
      });
    }
  })

  .delete(function(req, res){
    console.log("dans DELETE /playlists");
    if(req.query.id&&req.query.steamid){
      db.collection('playlists').remove({'_id': req.query.id, 'steamid': req.query.steamid}, (err, result) => {
        if(err){
          console.log(err);
        }
        else{
          console.log(result);
        }
      })
    }
  })

/*io2.on('connection', function(socket){
  console.log("client connected to the server (spin) !");
  //user send his username
  socket.on('user', function(id, username, photo){
    console.log(username+' connected to the chat (spin)!');
    socket.emit('join', id, username, ' is connecting to the chat (spin)!', photo, urls, Date.now());
    //socket.broadcast.emit('otherJoin', allClients.length);
  });

  socket.on('disconnect', function(){
      //socket.broadcast.emit('bye', 'bisous');
  });

  socket.on('writeMessage', function(id, username, message, photo){
    if(username&&id&&message){
      socket.broadcast.emit('message', id, username, message, photo, Date.now());
    }
    else{
      socket.emit('error', 'Username is not set yet');
    }
  });

});*/

// REGISTER OUR ROUTES -------------------------------
app.get('/', routerView);
app.use('/api', router);

// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steam.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
app.get('/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/404' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/404' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/test', ensureAuthenticated, function(req, res){
  res.render('test', { user: req.user });
});

app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/public'));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}



http.get('http://backpack.tf/api/IGetMarketPrices/v1/?key='+backpackApiKey+'&appid=730', function(response) {
    // Continuously update stream with data
    var body = '';
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {
        // Data reception is done, do whatever with it!
        var parsed = JSON.parse(body);
        marketPrices=parsed;
    });
});

function repeatMarketPrice(){
  setTimeout(function(){ 
    http.get('http://backpack.tf/api/IGetMarketPrices/v1/?key='+backpackApiKey+'&appid=730', function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            marketPrices = parsed;
        });
    }); 
  }, 320000);
}

// START THE SERVER
// =============================================================================
// Connect to Mongo on start
/*db.connect('mongodb://localhost:27017/csgo', function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.');
    process.exit(1);
  } else {
    server.listen(port, function() {
      console.log('Server listening on port ' + port);
    })
  }
});*/

MongoClient.connect('mongodb://mramart:password@ds011231.mlab.com:11231/csgo-fun', (err, database) => {
  if (err) return console.log(err)
  db = database
  if (database){
    console.log("Database connected");
  }
  server.listen(port, function() {
    console.log('Server listening on port ' + port);
  })
});

/*server.listen(port, function() {
      console.log('Server listening on port ' + port);
    })*/