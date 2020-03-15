var CLIENT_ID = '529143f2174b4352afc00dfd7877c549';
var REDIRECT_URI = 'https://wickedcube.github.io/callback/';
var ACCESS_TOKEN = '';
var TRACK_SEARCH_LIMIT = 5;

var loginButton = document.getElementById('btn-login');
var trackSearchDiv = document.getElementById('trackSearchDiv');
var trackSearchInput = document.getElementById('trackSearchInput');

function login() {
    var width = 450,
        height = 730,
        left = (screen.width / 2) - (width / 2),
        top = (screen.height / 2) - (height / 2);

    var w = window.open(url,
        'Spotify',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
    );

    window.addEventListener("message", function (event) {
        var hash = JSON.parse(event.data);
        if (hash.type == 'access_token') {
            ACCESS_TOKEN = hash.access_token;
            loginButton.style.display = 'none';
            trackSearchDiv.style.display = 'block';
        }
    }, false);
}

function spotifySearch(searchString){
    if(searchString.length > 4)
        getTracksData(searchString);
}

function getLoginURL(scopes) {
    return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
        '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
        '&scope=' + encodeURIComponent(scopes.join(' ')) +
        '&response_type=token';
}

var url = getLoginURL([
    'user-read-email',
    'user-modify-playback-state'
]);

function playMusic(track) {
    var albumID = track.id;
    var songIndex = track.track_number;
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.spotify.com/v1/me/player/play",
        "method": "PUT",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + ACCESS_TOKEN,
        },
        "processData": false,
        "data": "{\r\n  \"context_uri\": \"spotify:album:" + albumID + "\",\r\n  \"offset\": {\r\n    \"position\": " + songIndex + "\r\n  },\r\n  \"position_ms\": 100\r\n}"
    }

    $.ajax(settings);
}

function getTracksData(trackname) {
    var ajaxRequest = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.spotify.com/v1/search?q="+encodeURIComponent(trackname)+"&type=track&limit="+TRACK_SEARCH_LIMIT+"&offset=0",
        "method": "GET",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + ACCESS_TOKEN,
        },
        "success" : function (result){
            var tracks = result.tracks.items;
            var maxPopularity = -1;
            var maxPopularityIndex = -1;
            for (let index = 0; index < tracks.length; index++) {
                const element = tracks[index];
                if(element.popularity > maxPopularity)
                {
                    maxPopularity = element.popularity;
                    maxPopularityIndex = index;
                }
            }

            if(maxPopularityIndex > -1)
            {
                playMusic(tracks[maxPopularityIndex]);
                console.log(tracks[maxPopularityIndex].name + " " + maxPopularity);
            }
        }
    }

    $.ajax(ajaxRequest);
}

loginButton.addEventListener('click', function () {
    login();
});

trackSearchInput.addEventListener('keydown', function() {
  spotifySearch(trackSearchInput.value);
});