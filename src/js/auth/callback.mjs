***REMOVED***
    const urlParams = new URLSearchParams(window.location.search);
    const accTkn = urlParams.get('accTkn');
    const accTknSecret = urlParams.get('accTknSecret');
    const userId = urlParams.get('userId');
    const screenName = urlParams.get('screenName');
    if (accTknSecret && userId) {
        window.sessionStorage.setItem('accTkn', accTkn);
        window.sessionStorage.setItem('accTknSecret', accTknSecret);
        window.sessionStorage.setItem('userId', userId);
        window.sessionStorage.setItem('screenName', screenName);
        setTimeout(function(){ window.location.href = "/index.html"; }, 1000);
    } else {
        alert('Error in authenticating this user, try again later!');
        setTimeout(function(){ window.location.href = "/index.html"; }, 1000);
    }
***REMOVED***