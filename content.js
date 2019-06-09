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
console.log(cmd_regex);
console.log(cmd_regex_single);


// -----------------------------------------------------------------------------
//  Initialization : On completion,  window.mie_albums  will be set
// -----------------------------------------------------------------------------

chrome.storage.local.get({mie_albums: []}, OnSavedAlbumsLoad);
chrome.storage.local.get({mie_default_album: null}, OnDefaultAlbumLoad);

function	OnSavedAlbumsLoad(items)
{
	if (chrome.runtime.lastError) {
		console.log(chrome.runtime.lastError);
	}
	else if (items.mie_albums.length > 0) {
		window.mie_albums = items.mie_albums;
		console.log("got items: ");
		console.log(window.mie_albums);
	}
	else {
		console.log("items not found. Creating now.");
		window.mie_albums = [
				[ 'rBCv3jY', 'yagi-foxgirl' ],
				[ 'UtTtQXG', 'catman' ] ];
		chrome.storage.local.set(
			{'mie_albums': window.mie_albums},
			OnStorageSet);
	}
	window.mie_albums.forEach(function(album_arr) {
		GetEmojiSet(album_arr);
	});
}

function	OnDefaultAlbumLoad(items)
{
	if (chrome.runtime.lastError) {
		console.log(chrome.runtime.lastError);
	}
	else if (items.mie_default_album != null) {
		window.mie_default_album = items.mie_default_album;
		console.log("got default album: " + window.mie_default_album);
	}
	else {
		console.log("Default album not found. Creating now.");
		window.mie_default_album = 'yagi-foxgirl';
		chrome.storage.local.set(
			{'mie_default_album': window.mie_default_album},
			OnStorageSet);
	}
}

function	OnStorageSet()
{
	if (chrome.runtime.lastError) {
		console.log(chrome.runtime.lastError);
	}
	else {
		console.log('items created.');
	}
}

function	GetEmojiSet(album_arr)
{
	console.log('getting album images data for hash: ' + album_arr[0]);
	$.ajax({
		url: 'https://api.imgur.com/3/album/' + album_arr[0] + '/images',
		type: 'GET',
		headers: {
			Authorization: 'Client-ID 7ead1100b84dd7f'
		},
		success: function(data) {
			var min_data = [];
			data.data.forEach(function(img_data) {
				min_data.push([img_data.id, img_data.description, img_data.link]);
			});
			album_arr.push(min_data);
			console.log('got album data:');
			console.log(album_arr);
		},
		error: function(data) {
			console.log('error');
			console.log(data);
		}
	});
}


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
	console.warn('adding listener test function addTextArea() failed: testButton not found.');
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
		if (request.message === "disabled currently")
		{
			console.log(request.url);
		}
		else if (request.message === "propogate_to_log")
		{
			console.log(request.data);
		}
		else if (request.message === "query_album_hash")
		{
			QueryAlbumHash(request.album_hash, sendResponse);
		}
		else if (request.message === "add_album")
		{
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
			AddAlbum(request.album_hash, album_name, sendResponse);
		}
	});


function	AddAlbum(album_hash, album_name, sendResponse)
{
	var album_arr = [ album_hash, album_name ];
	GetEmojiSet(album_arr);
	window.mie_albums.push(album_arr);
	console.log('album added. window.mie_albums is now:');
	console.log(window.mie_albums);
}

function	QueryAlbumHash(album_hash, sendResponse)
{
	console.log('querying album hash: ' + album_hash);
	if (!(window.mie_albums))
	{
		console.error('could not query album hash: albums not yet loaded.');
		if (sendResponse) sendResponse({response: "error"});
		return null;
	}
	for (var i = 0; i < window.mie_albums.length; i++)
	{
		if (window.mie_albums[i][0] == album_hash)
		{
			if (sendResponse) sendResponse({response: "listed"});
			return true;
		}
	}
	if (sendResponse) sendResponse({response: "not_listed"});
	return false;
}





