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

var album_template = $(".album");
album_template.detach();

function RefreshAlbumDisplay()
{
	$('#albums-container').find('.album').remove();
	for (var i = 0; i < window.mie_albums.length; i++) {
		DisplayAlbum(window.mie_albums[i]);
	}
}

function DisplayAlbum(album_arr) {
	var album = album_template.clone();
	album.find('.album-image').attr('src', album_arr[2][0][2]);
	album.find('.album-link').find('a')
		.attr('href', 'https://imgur.com/a/' + album_arr[0]);
	album.find('.album-link').find('a')
		.html('https://imgur.com/a/' + album_arr[0]);
	album.find('.album-title').attr('value', album_arr[1]);
	album.appendTo($('#albums-container').find('table'));
	if (album_arr[1] == window.mie_default_album) {
		album.find('.set-as-default-button').css('display', 'none');
		album.find('.default-label').css('display', 'inline-block');
	}
	else {
		album.find('.set-as-default-button').css('display', 'default');
		album.find('.default-label').css('display', 'none');
	}
}

