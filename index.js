var CLIENT_ID = '529143f2174b4352afc00dfd7877c549';
var REDIRECT_URI = 'https://wickedcube.github.io/callback/';
var ACCESS_TOKEN = '';
var TRACK_SEARCH_LIMIT = 5;
var LAST_TRACK_SEARCH_TERM = '';

var loginButton = $('#btn-login');
var trackSearchDiv = $('#trackSearchDiv');
var trackSearchInput = $('#trackSearchInput');
var topResultCard = $('#topResultCard');
var playButton = $('#PlayTrackButton');
var titleText = $('#titleText');
var lastTrack;

$(document).ready(function() {
  ACCESS_TOKEN =  getCookie('spotifyAToken');
  if(ACCESS_TOKEN != undefined && ACCESS_TOKEN != null)
  {
    titleText.text("Great!, You're logged in now, search for a track and enjoy");
    loginButton.css("display", "none");
    trackSearchDiv.css("display", "block");
  }
});

function setCookie(key, value, expiry) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

function eraseCookie(key) {
    var keyValue = getCookie(key);
    setCookie(key, keyValue, '-1');
}

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
            setCookie('spotifyAToken',ACCESS_TOKEN,'1');
            loginButton.css("display", "none");
            trackSearchDiv.css("display", "block");
        }
    }, false);
}

function spotifySearch(searchString){
    if(searchString.length > 4 && searchString != LAST_TRACK_SEARCH_TERM)
    {
        LAST_TRACK_SEARCH_TERM = searchString;
        searchSpotify(LAST_TRACK_SEARCH_TERM);
    }
    else if(searchString.length <= 4 || searchString == undefined || searchString == "" || searchString == null)
    {
         topResultCard.css("display", "none");
    }
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

function playMusic(trackURI) {
    var trackURI = lastTrack.uri;
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.spotify.com/v1/me/player/play",
        "method": "PUT",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + ACCESS_TOKEN,
        },
        "data": JSON.stringify({"uris":[trackURI]}),
    }

    $.ajax(settings);
}

function searchSpotify(trackname) {
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
                lastTrack = tracks[maxPopularityIndex];
                topResultCard.css("display", "block");
                topResultCard.find('.card-img-top').attr('src', lastTrack.album.images[0].url);
                topResultCard.find('.card-title').text(lastTrack.name);
                var artistNameString = "";
                for (let index = 0; index < lastTrack.artists.length; index++) {
                    const element = lastTrack.artists[index];
                    if(index < lastTrack.artists.length - 1)
                        artistNameString+=(element.name+",");
                    else
                        artistNameString+=element.name;
                }
                topResultCard.find('.card-text').text(artistNameString);
                lastTrack = tracks[maxPopularityIndex];
                //console.log(lastTrack + " " + maxPopularity);
            }
            else
            {
                topResultCard.css("display", "none");
            }
        }
    }

    $.ajax(ajaxRequest);
}

loginButton.on('click', function () {
    login();
});

playButton.on('click', function () {
    playMusic();
});

trackSearchInput.on('keydown', function() {
  spotifySearch(trackSearchInput.val());
});