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

function	OnReinitializePageButtonClick(eventObject)
{
	GetActiveTab(function(activeTab) {
		chrome.tabs.sendMessage(activeTab.id, {
			"message": "reinitialize_page"
		});
	});
}

$('#reinitialize-page-button').click(OnReinitializePageButtonClick);

LogMessageToActiveTab('opened the extension popup!');

$('#control-panel-button').click(OpenControlPanel);

function	OpenControlPanel(eventObject)
{
	var optionsUrl = chrome.extension.getURL('control-panel.html');
	window.open(optionsUrl);
}





