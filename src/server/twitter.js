import Twitter from 'twitter-lite';
import env from 'dotenv';


if (process.env.NODE_ENV !== 'production') {
    env.config();
    console.log('dot env config');
}

const client = new Twitter({
    subdomain: "api", // "api" is the default (change for other subdomains)
    version: "1.1", // version "1.1" is the default (change for other subdomains)
    consumer_key: "CTgCAios1go5elZ3P3Z6w5XHU", // from Twitter.
    consumer_secret: "rhrcLbKAbJHXg0qX106oXTBjMQj6gXRnCvROzNRRyvPGvswqG5", // from Twitter.
});

export const authenticate = (request, response) => {
    client
    .getRequestToken("https://twitternfts.herokuapp.com/callback")
    .then(res =>
        {
            console.log({
                reqTkn: res.oauth_token,
                reqTknSecret: res.oauth_token_secret
            ***REMOVED***
            //response.status(200).json({reqTkn: res.oauth_token,
            ///    reqTknSecret: res.oauth_token_secret});
            response.redirect('https://api.twitter.com/oauth/authenticate?oauth_token='+res.oauth_token);
        }
    )
    .catch(console.error);
}

export const callback = (request, response) => {
    const oauthToken = request.query.oauth_token
    const oauthVerifier = request.query.oauth_verifier
    client
    .getAccessToken({
        oauth_verifier: oauthVerifier,
        oauth_token: oauthToken
***REMOVED***
    .then(res => {
        console.log({
            accTkn: res.oauth_token,
            accTknSecret: res.oauth_token_secret,
            userId: res.user_id,
            screenName: res.screen_name
        ***REMOVED***;
            response.status(200).json(
                {
                    accTkn: res.oauth_token,
                    accTknSecret: res.oauth_token_secret,
                    userId: res.user_id,
                    screenName: res.screen_name
                }
             );
    }
       
  )
  .catch(console.error);
}