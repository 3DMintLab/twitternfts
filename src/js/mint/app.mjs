import axios from 'axios'
import FormData from 'form-data'; 
import html2canvas from 'html2canvas';

var getCanvas;
const regex = /^https:\/\/twitter\.com\/[\w]+\/status\/(\d+)\?s\=[\d]*/
export const post_regex = regex;

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

export async function upload() {
    let return_data = { error: 0, message: '' };
    // function return value
    var img = getCanvas.toDataURL();
    // Convert Base64 image to binary
    var file =  dataURItoBlob(img);
    var HOST = process.env.API || location.origin;
    const url = HOST + "/upload";
    try {
        if (!file) {
            alert('NO File has been selected');
            return;
        }
        // no file selected
        // formdata
        let data = new window.FormData();
        data.append('file', file);
        let response = await fetch(url, {
            method: 'POST',
            body: data
    ***REMOVED***;
        // server responded with http response != 200
        if(response.status != 200) {
            console.log(response)
            throw new Error('HTTP response code != 200');
        }
        let json_response = await response.json();
        return_data.ipfs_hash = json_response.ipfs_hash;
        if(json_response.error == 1)
            throw new Error(json_response.message);	
    }
    catch(e) {
        console.log(e);
        // catch rejected Promises and Error objects
        return_data = { error: 1, message: e.message };
    }
    return return_data;
}

(async function () {

    const twiturl = $("#twiturl");

    twiturl.on('change', function(e) {
        const value = e.target.value;
        if (value) {
            const match = value.match(regex);
            if (!match) {
                alert('Invalid twitter url!');
                $('#mintbtn').prop('disabled', true);
                return;
            }
            if (match[0]) {
                loadTwit(match[0]);
            }            
        } else {
            $('#mintbtn').prop('disabled', true);
        }
***REMOVED***;

    async function generatePicture() {
        html2canvas(document.getElementById('preview'), {
            useCORS: true,
            allowTaint: true,
            letterRendering: 1,
    ***REMOVED***.then(
            function (canvas) {
                document.getElementById("previewImage").appendChild(canvas);
                getCanvas = canvas;
                $('#btn-Convert-Html2Image').css('display', 'block');
                $('#mintbtn').prop('disabled', false);
            }
        );
    }

    async function loadTwit(url) {
        var HOST = process.env.API || location.origin;
        const payload = await fetch(HOST+'/oembed?url='+url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'GET'
    ***REMOVED***.then((response) => response.json());
        document.getElementById('twitter_container').innerHTML = payload.html;
        generatePicture();
    }

    $("#btn-Convert-Html2Image").on('click', function () {
        var imgageData = getCanvas.toDataURL("image/png");
        // Now browser starts downloading it instead of just showing it
        var newData = imgageData.replace(/^data:image\/png/, "data:application/octet-stream");
        $("#btn-Convert-Html2Image").attr("download", "poem.png").attr("href", newData);
***REMOVED***;
***REMOVED***