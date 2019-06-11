// -----------------------------------------------------------------------------
//  Initialization : On completion,  window.mie_albums  will be set
// -----------------------------------------------------------------------------
LoadAlbums().then(
	function() { //resolve
		console.log('success loading albums')
		//Since we were successful in the last step, load the album images data
		window.mie_albums.forEach(function(album_arr) {
			GetEmojiSet(album_arr).then(
				function() { 
					console.log('success loading album images data');
					DisplayAlbum(album_arr);
				},
				function() { console.log('error loading album images data'); }
			);
		});
	},
	function() { console.log('failed to load albums') });

LoadDefaultAlbum().then(
	function() { console.log('success loading default album') },
	function() { console.log('failed to load default album') });

LoadCommandStart().then(
	function() {
		console.log('success loading command start');
		$('#cmd-begin').attr('value', window.mie_cmd_start);
	},
	function() { console.log('failed loading command start') });

LoadCommandEnd().then(
	function() {
		console.log('success loading command end');
		$('#cmd-end').attr('value', window.mie_cmd_end);
	},
	function() { console.log('failed loading command end') });


var album_template = $("tr.album");
album_template.detach();

var url_wrapper_template = $('tr.wrapper');
url_wrapper_template.detach();

function	RefreshAlbumDisplay() {
	$('#albums-container').find('.album').remove();
	for (var i = 0; i < window.mie_albums.length; i++) {
		DisplayAlbum(window.mie_albums[i]);
	}
}

function	DisplayAlbum(album_arr) {
	var album = album_template.clone();
	album.find('.album-image').attr('src', album_arr[2][0][2]);
	album.find('.album-link').find('a')
		.attr('href', 'https://imgur.com/a/' + album_arr[0]);
	album.find('.album-link').find('a')
		.html('https://imgur.com/a/' + album_arr[0]);
	album.find('.album-title').attr('value', album_arr[1]);
	album.appendTo($('#albums-container').find('table'));
	album.find('.set-as-default-button').click(OnSetAsDefaultButtonClick);
	album.find('.album-delete-button').click(OnRemoveButtonClick);
	if (album_arr[1] == window.mie_default_album) {
		album.find('.set-as-default-button').css('display', 'none');
		album.find('.default-label').css('display', 'inline-block');
	}
	else {
		album.find('.set-as-default-button').css('display', 'inline-block');
		album.find('.default-label').css('display', 'none');
	}
}

function	AddNewUrlWrapperRow()
{
	var wrapper = url_wrapper_template.clone();
	wrapper.appendTo($('#wrappers-container').find('table'));
	return (wrapper);
}

$('#add-wrapper-button').click(AddNewUrlWrapperRow);

LoadUrlWrappers().then(
	function() {
		for (var i = 0; i < window.mie_url_wrappers.length; i++)
			DisplayUrlWrapper(window.mie_url_wrappers[i]);
		console.log('url wrappers displayed');
	},
	function() { console.log('failed to load url wrappers'); }
);

function	DisplayUrlWrapper(wrapper_arr) {
	var wrapper = AddNewUrlWrapperRow();
	wrapper.find('.wrapper-url-match').attr('value', wrapper_arr[0]);
	wrapper.find('.wrapper-input-start').attr('value', wrapper_arr[1]);
	wrapper.find('.wrapper-input-end').attr('value', wrapper_arr[2]);
}

function	RemoveDefaultAlbum() {
	$('#albums-container').find('.set-as-default-button').css('display', 'inline-block');
	$('#albums-container').find('.default-label').css('display', 'none');
}

function	OnSetAsDefaultButtonClick(eventObject) {
	RemoveDefaultAlbum();
	var album = $(eventObject.target).parents('tr.album');
	$('div.defaultlabel').css('display', 'none');
	$(eventObject.target).css('display', 'none');
	album.find('div.default-label').css('display', 'inline-block');
}

function	OnRemoveButtonClick(eventObject) {
	var album = $(eventObject.target).parents('tr.album');
	var tag = album.find('input.album-title').attr('value');
	var conf = confirm("Are you sure you want to remove the album '" + tag + "'?");
	if (conf)
		album.remove();
}

function	ValidatePreferences() {
	var cmd_start = $('#cmd-begin').val().trim();
	var cmd_end = $('#cmd-end').val().trim();
	if (cmd_start.length < 1 || cmd_end.length < 1) {
		$('#error-message').html('Command start and command end cannot be empty');
		return false;
	}
	var album_titles = $('input.album-title').toArray();
	for (var i = 0; i < album_titles.length; i++) {
		if ($(album_titles[i]).val().trim().length < 1) {
			$('#error-message').html('Album names cannot be empty');
			return false;
		}
		if ($(album_titles[i]).val().match(/[^a-zA-Z0-9_-]/i)) {
			$('#error-message').html('Album names may only contain a-z, 0-9, _ and -');
			return false;
		}
	}
	$('#error-message').html('');
	return true;
}

function	OnSavePreferencesButtonClick() {
	ValidatePreferences() && SavePreferences();
}

function	SavePreferences() {
	var cmd_start = $('#cmd-begin').val().trim();
	var cmd_end = $('#cmd-end').val().trim();
	var albums = $('tr.album').toArray();
	var url_wrappers = $('tr.wrapper').toArray();
	var mie_albums = [];
	var mie_wrappers = [];
	var hash;
	var match;
	var tag;
	var visible_default_album;
	var default_album;
	var wrap_end;
	var wrap_start;
	for (var i = 0; i < albums.length; i++) {
		url = $(albums[i]).find('div.album-link').find('a').html();
		console.log(url);
		match = url.match(/https:\/\/imgur\.com\/a\/([a-z0-9_-]*)/i);
		hash = match[1];
		tag = $(albums[i]).find('input.album-title').val().trim();
		mie_albums.push([hash, tag]);
	}
	for (var i = 0; i < url_wrappers.length; i++) {
		url = $(url_wrappers[i]).find('.wrapper-url-match').val().trim();
		wrap_start = $(url_wrappers[i]).find('.wrapper-input-start').val().trim();
		wrap_end = $(url_wrappers[i]).find('.wrapper-input-end').val().trim();
		if (url.length > 0)
			mie_wrappers.push([url, wrap_start, wrap_end]);
	}
	var visible_default_album = $('div.default-label:visible');
	if (visible_default_album)
		default_album = visible_default_album.parents('tr.album')
			.find('input.album-title').val().trim();
	else
		default_album = null;
	console.log('saving data:');
	console.log(mie_albums);
	console.log("with cmd_start = '" + cmd_start + "' and cmd_end = '" + cmd_end + "'");
	console.log("default album is '" + default_album + "'");
	console.log('url wrappers:');
	console.log(mie_wrappers);
	SaveAlbums(mie_albums).then(
		function() {
			console.log('success saving albums');
			window.mie_albums = mie_albums;
			window.mie_default_album = default_album;
			window.mie_cmd_start = cmd_start;
			window.mie_cmd_end = cmd_end;
			SaveDefaultAlbum().then(
				function() { console.log('success saving default album'); },
				function() { console.log('failed to save default album'); }
			);
			SaveCommandStartEnd().then(
				function() { console.log('success saving command start and end'); },
				function() { console.log('failed to save command start and end'); }
			);
			SaveUrlWrappers(mie_wrappers).then(
				function() { console.log('success saving url wrappers'); },
				function() { console.log('failed to save url wrappers'); }
			);
		},
		function() { console.log('failed saving albums'); }
	);
	return true;
}
	
$('#save-button').click(OnSavePreferencesButtonClick);








































