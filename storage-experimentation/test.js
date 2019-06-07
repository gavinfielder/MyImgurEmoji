// -----------------------------------------------------------------------------
//  Initialization : On completion,  window.mie_albums  will be set
// -----------------------------------------------------------------------------

chrome.storage.local.get({mie_albums: []}, OnStorageLoad);

function	OnStorageLoad(items)
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
//  Initialization : On completion,  window.mie_albums  will be set
// -----------------------------------------------------------------------------


