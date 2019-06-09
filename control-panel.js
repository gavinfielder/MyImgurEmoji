/*
chrome.browserAction.onClicked.addListener(function(tab)
	{
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
			{
				var activeTab = tabs[0];
				chrome.tabs.sendMessage(activeTab.id, {
					"message": "clicked_browser_action",
					"url": activeTab.url
				});
			}
		);
	});
*/

//$('#add-album-button').click(


//If the popup is opened on an imgur album, see if we've already
//listed the album in our settings
GetActiveTab(function(activeTab) {
LogMessageToActiveTab('on url: ' + activeTab.url);
var match = activeTab.url.match(/imgur\.com\/a\/([a-z0-9_-]*)/i);
if (match) {
	$('#add-album-button').css('display', 'inline-block');
	var album_hash = match[1];
	chrome.tabs.sendMessage(activeTab.id, {
			"message": "query_album_hash",
			"album_hash": album_hash
		},
		function(response) {
			if (response.response == "listed") {
				$('#add-album-button').html('Album already listed');
				$('#add-album-button').prop('disabled', true);
			}
			else if (response.response == "not_listed") {
				$('#add-album-button').prop('disabled', false);
				$('#add-album-button').click(OnAddAlbumClick);
			}
	});
}
else {
	//not an imgur album
	$('#add-album-button').css('display', 'none');
}
}); //end GetActiveTab(function(activeTab) { ...

function	GetActiveTab(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
		{
			var activeTab = tabs[0];
			callback(activeTab);
		}
	);
}

function	LogMessageToActiveTab(msg)
{
	GetActiveTab(function(activeTab) {
		chrome.tabs.sendMessage(activeTab.id, {
			"message": "propogate_to_log",
			"data": msg
		});
	});
}

function	OnAddAlbumClick(eventObject)
{
	var btn = eventObject.target;
	GetActiveTab(function(activeTab) {
		var match = activeTab.url.match(/imgur\.com\/a\/([a-z0-9_-]*)/i);
		if (!match)
		{
			alert('error: no match on add album click');
			return ;
		}
		chrome.tabs.sendMessage(activeTab.id, {
			"message": "add_album",
			"album_hash": match[1]
		});
	});
}

LogMessageToActiveTab('opened the extension popup!');















