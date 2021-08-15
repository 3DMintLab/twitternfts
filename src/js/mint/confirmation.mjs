window.$ = window.jQuery = import("jquery");

***REMOVED***
    const urlParams = new URLSearchParams(window.location.search);
    const ipfs = urlParams.get('ipfs');
    const transaction = urlParams.get('transaction');
    console.log(`ipfs: ${ipfs} transaction ${transaction} https://ipfs.io/ipfs/${ipfs}`);
    document.getElementById('picture').setAttribute('src', `https://ipfs.io/ipfs/${ipfs}`);
    document.getElementById("ipfs").innerHTML = `IPFS Code: ${ipfs}`;
    // document.getElementById("hash").innerHTML = `<a href="https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=${transaction}" target="_blank">Transaction ${transaction}</a>`;
    document.getElementById("hash").innerHTML = `<a href="https://explorer.cardano.org/en/transaction?id=${transaction}" target="_blank">Transaction ${transaction}</a>`;
***REMOVED***