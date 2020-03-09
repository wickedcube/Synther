(function () {

    function login(callback) {
        var CLIENT_ID = '529143f2174b4352afc00dfd7877c549';
        var REDIRECT_URI = 'https://wickedcube.github.io/callback/';
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

        var width = 450,
            height = 730,
            left = (screen.width / 2) - (width / 2),
            top = (screen.height / 2) - (height / 2);

        window.addEventListener("message", function (event) {
            var hash = JSON.parse(event.data);
            if (hash.type == 'access_token') {
                console.log(hash.access_token);
                callback(hash.access_token);
            }
        }, false);

        var w = window.open(url,
            'Spotify',
            'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
        );

    }

    function getUserData(accessToken) {
        return $.ajax({
            method: "POST",
            url: 'https://api.spotify.com/v1/me/player/play',
            data: {
            "context_uri": "spotify:album:35s58BRTGAEWztPo9WqCIs",
            "offset": {
                "position": 1
            },
            "position_ms": 100
            },
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }

    var templateSource = document.getElementById('result-template').innerHTML,
        template = Handlebars.compile(templateSource),
        resultsPlaceholder = document.getElementById('result'),
        loginButton = document.getElementById('btn-login');

    loginButton.addEventListener('click', function () {
        login(function (accessToken) {
            getUserData(accessToken)
                .then(console.log("Play Started"));
        });
    });

})();