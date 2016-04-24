var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PlaylistSchema   = new Schema({
	name: String,
	steamid: String,
	items: array
});

module.exports = mongoose.model('Playlist', PlaylistSchema);