// -----------------------------------------------------------------------------
//  Functions that load and store user album preferences in local storage
// -----------------------------------------------------------------------------

function	LoadAlbums()
{
	return new Promise(function(resolve, reject)
	{
		chrome.storage.local.get({mie_albums: []}, 
			function(items)
			{
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject(Error('There was a problem loading user data from local storage'));
				}
				else if (items.mie_albums.length > 0) {
					window.mie_albums = items.mie_albums;
					console.log("got items: ");
					console.log(window.mie_albums);
					resolve();
				}
				else {
					console.log("items not found. Creating now.");
					window.mie_albums = [
							[ 'rBCv3jY', 'yagi-foxgirl' ],
							[ 'UtTtQXG', 'catman' ] ];
					resolve();
					chrome.storage.local.set(
						{'mie_albums': window.mie_albums},
						OnStorageSet);
				}
			});
	});
}

function	LoadDefaultAlbum()
{
	return new Promise(function(resolve, reject)
	{
		chrome.storage.local.get({mie_default_album: null},
			function(items)
			{
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject(Error('There was a problem loading the default album'));
				}
				else if (items.mie_default_album != null) {
					window.mie_default_album = items.mie_default_album;
					console.log("got default album: " + window.mie_default_album);
					resolve();
				}
				else {
					console.log("Default album not found. Creating now.");
					window.mie_default_album = 'yagi-foxgirl';
					resolve();
					chrome.storage.local.set(
						{'mie_default_album': window.mie_default_album},
						OnStorageSet);
				}
			});
	});
}

function	GetEmojiSet(album_arr)
{
	return new Promise(function(resolve, reject)
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
				resolve();
				console.log('got album data:');
				console.log(album_arr);
			},
			error: function(data) {
				reject(Error('error fetching album data from imgur api'));
			}
		});
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

