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
					console.log("no albums found.");
					window.mie_albums = [];
					resolve();
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

function	LoadCommandStart() {
	return new Promise(function(resolve, reject)
	{
		chrome.storage.local.get({mie_cmd_start: '@mie'}, 
			function(items)
			{
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject(Error('There was a problem loading command start.'));
				}
				else if (items.mie_cmd_start && items.mie_cmd_start.length > 0)
				{
					window.mie_cmd_start = items.mie_cmd_start;
					resolve(window.mie_cmd_start);
				}
				else {
					console.log("items not found. Creating now.");
					window.mie_cmd_start = '@mie';
					resolve(window.mie_cmd_start);
					chrome.storage.local.set(
						{'mie_cmd_start': window.mie_cmd_start},
						OnStorageSet);
				}
			});
	});
}

function	LoadCommandEnd() {
	return new Promise(function(resolve, reject)
	{
		chrome.storage.local.get({mie_cmd_end: '@'}, 
			function(items)
			{
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject(Error('There was a problem loading command end.'));
				}
				else if (items.mie_cmd_end && items.mie_cmd_end.length > 0)
				{
					window.mie_cmd_end = items.mie_cmd_end;
					resolve(window.mie_cmd_end);
				}
				else {
					console.log("items not found. Creating now.");
					window.mie_cmd_end = '@mie';
					resolve(window.mie_cmd_end);
					chrome.storage.local.set(
						{'mie_cmd_end': window.mie_cmd_end},
						OnStorageSet);
				}
			});
	});
}


function	SaveAlbums(new_albums)
{
	if (new_albums == undefined)
		new_albums = window.mie_albums;
	return new Promise(function(resolve, reject)
	{
		if (!(new_albums)) {
			reject(Error('error saving albums: no album data loaded'));
			return false;
		}
		var mie_albums = [];
		for (var i = 0; i < new_albums.length; i++)
			mie_albums.push([new_albums[i][0], new_albums[i][1]]);
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

function	SaveDefaultAlbum()
{
	return new Promise(function(resolve, reject)
	{
		if (window.mie_default_album == undefined) {
			window.mie_default_album = null;
		}
		chrome.storage.local.set(
			{'mie_default_album': window.mie_default_album},
			function() {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject(Error('runtime error while saving default album'));
				}
				else {
					resolve();
					console.log('default album saved.');
				}
			});
	});
}

function	SaveCommandStartEnd()
{
	return new Promise(function(resolve, reject)
	{
		if (!(window.mie_cmd_start) || !(window.mie_cmd_end)) {
			reject(Error('error saving command start and command end: varibles undefined'));
			return false;
		}
		chrome.storage.local.set(
			{
				'mie_cmd_start': window.mie_cmd_start,
				'mie_cmd_end': window.mie_cmd_end
			},
			function() {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject(Error('runtime error while saving command start and command end'));
				}
				else {
					resolve();
					console.log('command start and command end saved');
				}
			});
	});
}

function	SaveUrlWrappers(new_wrappers)
{
	if (new_wrappers == undefined)
		new_wrappers = window.mie_url_wrappers;
	return new Promise(function(resolve, reject)
	{
		if (!(new_wrappers)) {
			reject(Error('error saving url wrappers: no url wrapper data loaded'));
			return false;
		}
		chrome.storage.local.set(
			{'mie_url_wrappers': new_wrappers},
			function() {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject(Error('runtime error while saving url wrappers'));
				}
				else {
					resolve();
					console.log('url wrappers saved.');
				}
			});
	});
}

function	LoadUrlWrappers()
{
	return new Promise(function(resolve, reject)
	{
		chrome.storage.local.get({mie_url_wrappers: []}, 
			function(items)
			{
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
					reject(Error('There was a problem loading url wrappers'));
				}
				else if (items.mie_url_wrappers.length > 0) {
					window.mie_url_wrappers = items.mie_url_wrappers;
					console.log("got url wrappers: ");
					console.log(window.mie_url_wrappers);
					resolve();
				}
				else {
					window.mie_url_wrappers = [];
					console.log("got empty url wrapper collection");
					resolve();
				}
			});
	});
}

















