import logMessage from './js/logger.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'popper.js';
import 'jquery';
import './css/cover.css'
import regeneratorRuntime from "regenerator-runtime";
window.$ = window.jQuery = import("jquery");
import 'bootstrap/js/dropdown.js';

// Log message to console
const curent = window.location.pathname;
logMessage(window.location.pathname);

async function getComponent() {
    if (curent === "/" || curent === "/index.html") {
        var apiurl = process.env.NODE_ENV === 'development' ? process.env.API : location.origin;
        const { upload, post_regex } = await import('./js/mint/app.mjs');
        const { MintTx } = await import('./js/mint/mint.mjs');
        const { getSpinner } = await import('./js/spinner.mjs');
        var HOST = location.origin;

        async function activateCardano() {
            const promise = await cardano.enable()
            $("#connectBtn").text('Connected');
            $("#connectBtn").attr('class', 'btn btn-success');
        }
        if (typeof cardano != "undefined") {
            activateCardano();
        } else {
            alert('Nami wallet not installed or browser is incompatible.')
        }
        
        $("#mintbtn").on('click', async () => {
            var target = document.getElementById('body');
            var spinner = getSpinner(target);
            const imageHash = await upload();
            console.log(imageHash);
            try {
                const twiturl = $("#twiturl").val();
                const match = twiturl.match(post_regex);

                let metadata = {
                    name: "TWIT#"+match[1],
                    quantity: "1",
                    metadata: {
                        collection: "Cheff Labs Twitter NFTs",
                        type: "twitter",
                        image: `ipfs://${imageHash.ipfs_hash}`,
                        url: twiturl
                    }
                };
                console.log(metadata);
                let txHash = await MintTx(metadata);
                console.log(txHash);
                if (txHash.error) {
                    spinner.stop();
                    alert(`transaction error: ${txHash.error}`)
                    return;
                }
                spinner.stop();
                window.location.replace(`${HOST}/confirmation.html?ipfs=${imageHash.ipfs_hash}&transaction=${txHash}`);
            } catch (error) {
              console.log(error)
            }
    ***REMOVED***;
        console.log('this is mint.js');
    }
    if (curent === "/confirmation.html") {
        const { default: app } = await import('./js/mint/confirmation.mjs');
    }
    const element = document.createElement('script');
    return element;
}

getComponent().then((component) => {
    document.body.appendChild(component);
});
