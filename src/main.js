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
    const S = await import('@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib.js');
    const _Buffer = (await import('buffer/')).Buffer;
    async function activateCardano() {
        if (!$("#connectBtn")) {
            return;
        }
        const promise = await cardano.enable();
        const addr = await cardano.getChangeAddress();
        const paymentAddr = S.Address.from_bytes(_Buffer.from(addr, 'hex')).to_bech32();
        const length = paymentAddr.length;
        const networkId = await cardano.getNetworkId();
        if (networkId != 1) {
            $("#connectBtn").text('Testnet');
            $("#connectBtn").attr('class', 'btn btn-danger');
        } else {
            $("#connectBtn").text(`${paymentAddr.substring(0, 6)}...${paymentAddr.substring(length-10,length)}`);
            $("#connectBtn").attr('class', 'btn btn-success');
        }
    }
    if (typeof cardano != "undefined") {
        activateCardano();
    } else {
        alert('Nami wallet not installed or browser is incompatible.')
        $("#connectBtn").text('Not Connected');
        $("#connectBtn").attr('class', 'btn btn-danger');
    }
    if (curent === "/" || curent === "/create.html") {
        const { MintTx } = await import('./js/mint/mint.mjs');
        const { getSpinner } = await import('./js/spinner.mjs');

        $("#htmlselect").on('change', (e) => {
            console.log(e.target.checked);
            if (e.target.checked) {
                $('#container_htmlsource_preview').css('display','block');
            } else {
                $('#container_htmlsource_preview').css('display','none');
            }
        })
        $("#previewbtn").on('click', () => {
            var metadata = {
                name: document.getElementById('name').value,
                quantity: document.getElementById('quantity').value,
                metadata: {
                    image: `ipfs://${document.getElementById('ipfs').value}`
                }
            };
            if($("#metadataselect").is(':checked')) {
                var extrametadata = document.getElementById('extrametadata').value;
                if (extrametadata && extrametadata !== "") {
                    try {
                        var extradata = JSON.parse(extrametadata);
                        Object.assign(metadata, extradata);
                    } catch {
                        alert('🥺 invalid metadata! correct your json.');
                        return;
                    }
                }
            }
            if($("#htmlselect").is(':checked')) {
                var htmlcontent = document.getElementById('htmlcode').value;
                document.getElementById('htmlsource_preview').src = "data:text/html;charset=utf-8," + escape(htmlcontent);
                const htmlbase64 = 'data:text/html;base64,' + btoa(htmlcontent);
                const source = htmlbase64.match(/.{1,64}/g);
                metadata.metadata.files = {
                    files: [
                        {
                           name: "source",
                           mediaType: "text/html",
                           src: source
                        }
                    ]
                }
            }
            document.getElementById('metadatapreview').innerHTML = JSON.stringify(metadata);
        });

        $("#mintbtn").on('click', async () => {
            const ipfs = $("#ipfs").val();
            const name = $("#name").val();
            const html = $('#htmlcode').val();
            const quantity = $("#quantity").val();
            const extrametadata = $("#extrametadata").val();
            const metadatapreview = $("#metadatapreview");
            var target = document.getElementById('body');
            var spinner = getSpinner(target);
            try {
                
                if (name.length === 0) {
                    alert('😵 NFT name is mandatory');
                    return;
                }
                if (ipfs.length === 0) {
                    alert('🥱 Your IPFS code is mandatory');
                    return;
                }
                if (quantity.length === 0 || quantity <= 0) {
                    alert('😢 Invalid quantity');
                    return;
                }
                if($("#htmlselect").is(':checked')) {
                    if (html.length === 0) {
                        alert('😅 In case you marked the HTML JS code, please add something to it...');
                        return;
                    }
                }
                if($("#metadataselect").is(':checked')) {
                    if (extrametadata.length === 0) {
                        alert('😅 In case you marked the extra Metadata, please add something to it...');
                        return;
                    }
                }

                var metadata = {
                    name: name,
                    quantity: quantity,
                    metadata: {
                        image: `ipfs://${ipfs}`
                    }
                };
                if($("#htmlselect").is(':checked')) {
                    if (html.length > 0) {
                        const htmlbase64 = 'data:text/html;base64,' + btoa(html);
                        const source = htmlbase64.match(/.{1,64}/g);
                        metadata.metadata.files = {
                            files: [
                                {
                                   name: "source",
                                   mediaType: "text/html",
                                   src: source
                                }
                            ]
                        }
                    }
                }
                if($("#metadataselect").is(':checked')) {
                    if (extrametadata.length > 0) {
                        try {
                            var extradata = JSON.parse(extrametadata);
                            Object.assign(metadata, extradata);
                        } catch {
                            alert('🥺 invalid metadata! correct your json.');
                            return;
                        }
                    }
                }
                console.log(JSON.stringify(metadata));
                metadatapreview.html(JSON.stringify(metadata));
                var canMint = confirm('Are you ready to mint?');
                if (!canMint) {
                    return;
                }
                let txHash = await MintTx(metadata);
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
        });
    }
    if (curent === "/" || curent === "/index.html") {
        var apiurl = process.env.NODE_ENV === 'development' ? process.env.API : location.origin;
        const { upload, post_regex } = await import('./js/mint/app.mjs');
        const { MintTx } = await import('./js/mint/mint.mjs');
        const { getSpinner } = await import('./js/spinner.mjs');
        var HOST = location.origin;
        
        let accTknSecret = sessionStorage.getItem('accTknSecret');
        if (!accTknSecret) {
            $('#authform').css("display","block");
            $('#mintform').css("display","none");
        } else {
            $('#authform').css("display","none");
            $('#mintform').css("display","block");
        }
        $('#twitter-button').on('click', () => {
            window.location.href = '/token'
            console.log('redirect')
        })
        $("#mintbtn").on('click', async () => {
            var target = document.getElementById('body');
            var spinner = getSpinner(target);
            const imageHash = await upload();
            try {
                const twiturl = $("#twiturl").val();
                const match = twiturl.match(post_regex);

                let metadata = {
                    name: "Tweet#"+match[1],
                    quantity: "1",
                    metadata: {
                        collection: "Cheff Labs Twitter NFTs",
                        type: "twitter",
                        image: `ipfs://${imageHash.ipfs_hash}`,
                        url: twiturl.substr(0,64)
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
        });
    }
    if (curent === "/confirmation.html") {
        const { default: app } = await import('./js/mint/confirmation.mjs');
    }
    if (curent === "/callback.html") {
        const { default: app } = await import('./js/auth/callback.mjs');
    }
    if (curent === "/delegate.html") {
        const { default: app } = await import('./js/delegate.mjs');
    }
    const element = document.createElement('script');
    return element;
}

getComponent().then((component) => {
    document.body.appendChild(component);
});
