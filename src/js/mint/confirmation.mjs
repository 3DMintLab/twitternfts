window.$ = window.jQuery = import("jquery");

(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ipfs = urlParams.get('ipfs');
    const transaction = urlParams.get('transaction');
    console.log(`ipfs: ${ipfs} transaction ${transaction} https://ipfs.io/ipfs/${ipfs}`);
    document.getElementById('picture').setAttribute('src', `https://ipfs.io/ipfs/${ipfs}`);
    document.getElementById("ipfs").innerHTML = `IPFS Code: ${ipfs}`;
    document.getElementById("hash").innerHTML = `<a href="https://cardanoscan.io/transaction/${transaction}" target="_blank">Transaction ${transaction}</a>`;
})();