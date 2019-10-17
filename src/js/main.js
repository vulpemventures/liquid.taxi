const axios = require('axios');
const copy = require('copy-to-clipboard');

const SAMPLE_RAW_TX = "0200000000028ccaf013fb00eaa3f1ebdf6cef1815319d9b3944ec993e6c5425c2d89a025fbf000000006a4730440220779efe60dcf5e9c3b3f8bf449209d7df1ddb7db050a0b112b6fd9b774624a7180220123765641f65d25ad7dbf819edc3e42e0b49eb0bf1cc360a112e87f3e1bd0a4282210312ed6e5bc8931adda48e0254737a2c037f84e3ccc2c2ebc2a21f27c66274bb4affffffff18990fab5aea080f4ee7b8e874e1703defc860412a913ea6fa2340a212c7b5ba010000006a473044022041c62e4199dc591db30af0a1d2d8e314712a3eb4599851943b4466c5f1ca1abc0220529811a4dec70b71743ef9ef610723ce1f6d5e5748f54917f1a199c9547d8af182210312ed6e5bc8931adda48e0254737a2c037f84e3ccc2c2ebc2a21f27c66274bb4affffffff0201d31114fce70394c1f9d3547501b4b9d36f420236ec64199154566434885acf2d0100000002cb417800001976a91415bfa3930707352485408e631c0f97ef5f5fdbde88ac01d31114fce70394c1f9d3547501b4b9d36f420236ec64199154566434885acf2d01000000012a05f200001976a91450a410115f0a7d8a99472e47d1928ff8086948c888ac00000000";
const API_URL = "https://testnet.vulpem.com/nigiri-pay/order";

(function () {
  const doc = document
  const rootEl = doc.documentElement
  const body = doc.body
  //const lightSwitch = doc.getElementById('lights-toggle')
  /* global ScrollReveal */
  const sr = window.sr = ScrollReveal()

  rootEl.classList.remove('no-js')
  rootEl.classList.add('js')

  window.addEventListener('load', function () {
    body.classList.add('is-loaded')
  })

  // Reveal animations
  function revealAnimations() {
    sr.reveal('.feature', {
      duration: 600,
      distance: '20px',
      easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      origin: 'right',
      viewFactor: 0.2
    })
  }

  //body.classList.add('lights-off');

  if (body.classList.contains('has-animations')) {
    window.addEventListener('load', revealAnimations)
  }

  body.classList.add('lights-off')

  function onButtonClik(event) {
    event.preventDefault();
    const rawtx = document.getElementById("tx-input").value;
    axios.post(
      API_URL,
      {
        signedTx: rawtx,
        satPerByte: 1
      },
      {
        headers: { 'Content-Type': 'application/json' }
      })
      .then(function ({data}) {
        //handle success
        const { paymentRequest, hash, fees, spread, total } = data;

        document.getElementById("request-invoice").style.visibility = "hidden";
        document.getElementById("invoice").style.visibility = "visible";

        document.getElementById("invoice-input").value = paymentRequest;
        document.getElementById("fees-text").innerHTML = `fees ${fees} | spread ${spread} | Total ${total}` ;
        document.getElementById("hash-text").innerHTML = 
          `<a target="_blank" href="${API_URL}/${hash}">${hash}</a>`;  
        document.getElementById("qr-image").src = 
          "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + paymentRequest;

      })
      .catch(function (error) {
        //handle error
        console.error(error);
      });
  }

  function onCopyClik(event) {
    event.preventDefault();

    document.getElementById("copy-invoice-button").innerHTML = "👍👍👍";
    document.getElementById("copy-invoice-button").className = "button";
    //COpy to clipboard
    copy(document.getElementById("invoice-input").value);

    setTimeout(() => {
      document.getElementById("copy-invoice-button").innerHTML = "Copy";
      document.getElementById("copy-invoice-button").className = "button button-primary";
    }, 1200)

  }

  function onUseSampleClik(event) {
    event.preventDefault();    
    document.getElementById("tx-input").value = SAMPLE_RAW_TX;
  }

  document.getElementById("use-sample-button").addEventListener("click", onUseSampleClik);
  document.getElementById("topup-button").addEventListener("click", onButtonClik);
  document.getElementById("copy-invoice-button").addEventListener("click", onCopyClik);


}())
