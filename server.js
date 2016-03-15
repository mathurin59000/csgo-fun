// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app        = express();
var morgan     = require('morgan');
var path = require('path');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var db = require('./db');
var http = require('http');
var steamApiKey = '336F47CADE44154B12B320F6F6B4AA02';

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
mongoose.connect('mongodb://localhost:27017/mydatabase'); // connect to our database*/
var Bear     = require('./app/models/bear');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();
var routerView = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening in router.');
	next();
});

// middleware to use for all requests
routerView.use(function(req, res, next) {
	// do logging
	console.log('Something is happening in routerView.');
	next();
});

router.post('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/login');
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

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// Retrieve stats of a player 
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

// Retrieve actualities of the csgo community
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
            console.log(parsed);
            res.json(parsed);
        });
    });
});

// Retrieve steamid and passport
router.get('/steamid', function(req, res){
	res.json(req.session);
});

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

// START THE SERVER
// =============================================================================
// Connect to Mongo on start
/*db.connect('mongodb://localhost:27017/csgofun', function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.');
    process.exit(1);
  } else {
    app.listen(port, function() {
      console.log('Server listening on port ' + port);
    })
  }
});*/

app.listen(port, function() {
      console.log('Server listening on port ' + port);
    })