//user settings -- to be replaced by programmable settings
var cmd_regex_start_sequence = '@mie';
var cmd_regex_stop_sequence = '@';
var img_url_start = '[img]';
var img_url_end = '[/img]';

var cmd_regex = new RegExp(cmd_regex_start_sequence
							+ '(.*?)'
							+ cmd_regex_stop_sequence,
							'gi');
var cmd_regex_single = new RegExp(cmd_regex_start_sequence
							+ '(.*?)'
							+ cmd_regex_stop_sequence,
							'i');

// -----------------------------------------------------------------------------
//  Initialization : On completion,  window.mie_albums  will be set
// -----------------------------------------------------------------------------
LoadAlbums().then(
	function() { //resolve
		console.log('success loading albums')
		//Since we were successful in the last step, load the album images data
		for (var i = 0; i < window.mie_albums.length; i++) {
			GetEmojiSet(window.mie_albums[i]).then(
				function() { console.log('success loading album images data'); },
				function() { console.log('error loading album images data'); }
			);
		}
	},
	function() { console.log('failed to load albums') });

LoadDefaultAlbum().then(
	function() { console.log('success loading default album') },
	function() { console.log('failed to load default album') });

// -----------------------------------------------------------------------------
//  TESTING: adds a new text area
// -----------------------------------------------------------------------------

function	addTextArea()
{
	var ta = document.createElement("textarea");
	var cont = document.getElementById("testContainer");
	$(cont).html('<div id="testContainer"><textarea id="newTextArea">Hello World</textarea></div>');
}

try {
	document.getElementById("testButton").addEventListener("click", addTextArea);
	console.log('test button activated');
}
catch (err) {
	console.log('adding listener test function addTextArea() failed: testButton not found.');
}

// -----------------------------------------------------------------------------
//  Listen for input changes
// -----------------------------------------------------------------------------

//This is needed to add listeners to new textareas that are added to the page
var observer = new MutationObserver(function(mutations) {
	console.log('mutated!');
	console.log(mutations);
	mutations.forEach(function(mutation) {
		for (var i = 0; i < mutation.addedNodes.length; i++) {
			var elem = mutation.addedNodes[i];
			console.log('A DOM node was inserted: ' + elem.nodeName);
			$(elem).children("textarea").on('input', OnTextAreaInput);
		}
	})
});
observer.observe(document.body, { childList: true, subtree: true });

//Add listeners to all the text areas currently on the page
RegisterTextAreas();

function	OnTextAreaInput(eventObject)
{
	var elem = eventObject.target;
	var text = elem.value;
	var matches = text.match(cmd_regex_single);
	if (matches)
	{
		replacement = ParseCommand(matches);
		if (replacement) {
			replaced = text.replace(cmd_regex_single, replacement);
			elem.value = replaced;
			console.log('command accepted.');
		}
		else {
			console.log('invalid command');
		}
	}
}

function	RegisterTextAreas()
{
	var elements = document.querySelectorAll('textarea');
	for (var i = 0; i < elements.length; i++)
	{
		var element = elements[i];
		element.addEventListener("input", OnTextAreaInput);
	}
}

// -----------------------------------------------------------------------------
//  Command Parsing
// -----------------------------------------------------------------------------

//Accepts a regex match, with matches[0] including the start/end sequence and
//matches[1] being only the inner command. It returns a replacement for the
//entire match string (including start and end sequence), or null for invalid
function	ParseCommand(matches)
{
	console.log('processing command: \'' + matches[0] + '\'');
	var cmd = matches[1].trim();
	var ret = null;
	if ((ret = FetchEmoji(cmd))) return (ret);
	if ((ret = SnakePeople(cmd))) return (ret);
	return (ret);
}

function	SnakePeople(cmd)
{
	if (cmd.match(/millennial/gi))
		return (cmd.replace(/millennial/gi, 'snake people').trim());
	return (null);
}

function	FetchEmoji(cmd)
{
	album = GetRequestedAlbum(cmd);
	if (!album)
	{
		console.warn('could not load requested album or default album');
		return (null);
	}
	console.log('got requested album:');
	console.log(album);
	//If user gives a :tag: emoji literal, search using that
	if ((tag_id = cmd.match(/:.*?:/)))
	{
		url = GetEmojiUrlByTagId(album, tag_id);
		if (url != null)
			return (img_url_start + url + img_url_end);
	}
	return (null);
}

function	GetRequestedAlbum(cmd)
{
	var match = cmd.match(/-s\s+([a-z0-9_-]+)/i);
	if (match)
	{
		for (var i = 0; i < window.mie_albums.length; i++)
		{
			if (window.mie_albums[i][1] == match[1])
				return (window.mie_albums[i]);
		}
	}
	return (window.mie_default_album);
}

function	GetEmojiUrlByTagId(album, tag_id)
{
	//Loop through album images [2]
	for (var i = 0; i < album[2].length; i++)
	{
		//if description [1] has the given tag id, return its url [2]
		if (album[2][i][1].includes(tag_id))
			return (album[2][i][2]);
	}
	return (null);
}

// -----------------------------------------------------------------------------
//  Listen for Messages
// -----------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse)
	{
		if (request.message === "disabled currently") {
			console.log(request.url);
		}
		else if (request.message === "propogate_to_log") {
			console.log(request.data);
		}
		else if (request.message === "query_album_hash") {
			QueryAlbumHash(request.album_hash, sendResponse);
		}
		else if (request.message === "add_album") {
			var album_name = "";
			while (true) {
				album_name = (prompt("Enter a name for this album", album_name).trim());
				if (album_name == null)
					return ;
				else if (album_name == "" || album_name.match(/[^a-z0-9_-]/i))
					alert('Album names may only include a-z, A-Z, 0-9, _, and -, and cannot be empty');
				else
					break ;
			}
			AddAlbum(request.album_hash, album_name).then(
				function() { console.log('success adding album'); sendResponse('success'); },
				function() { console.log('failed to add album'); sendResponse('failure'); }
			);
		}
	});

function	SaveAlbums()
{
	return new Promise(function(resolve, reject)
	{
		if (!(window.mie_albums)) {
			reject(Error('error saving albums: no album data loaded'));
			return false;
		}
		var mie_albums = [];
		for (var i = 0; i < window.mie_albums.length; i++)
			mie_albums.push([window.mie_albums[i][0], window.mie_albums[i][1]]);
		chrome.storage.local.set(
			{'mie_albums': mie_albums},
			function() {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject(Error('runtime error while saving albums'));
				}
				else {
					resolve();
					console.log('albums saved.');
				}
			});
	});
}

function	AddAlbum(album_hash, album_name)
{
	return new Promise(function(resolve, reject)
	{
		var album_arr = [ album_hash, album_name ];
		GetEmojiSet(album_arr).then(
			function() { //on resolve
				window.mie_albums.push(album_arr);
				console.log('album added. window.mie_albums is now:');
				console.log(window.mie_albums);
				SaveAlbums().then(
					function() { resolve(); },
					function() { reject(Error('error saving albums.')); }
				);
			},
			function() { reject(Error('error getting emoji set for new album')); }
		);
	});
}

function	QueryAlbumHash(album_hash, sendResponse)
{
	console.log('querying album hash: ' + album_hash);
	if (!(window.mie_albums)) {
		console.error('could not query album hash: albums not yet loaded.');
		if (sendResponse) sendResponse({response: "error"});
		return null;
	}
	for (var i = 0; i < window.mie_albums.length; i++) {
		if (window.mie_albums[i][0] == album_hash) {
			if (sendResponse) sendResponse({response: "listed"});
			return true;
		}
	}
	if (sendResponse) sendResponse({response: "not_listed"});
	return false;
}

