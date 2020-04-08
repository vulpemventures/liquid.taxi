const axios = require('axios');
const copy = require('copy-to-clipboard');



(function () {
  const SAMPLE_RAW_TX = "cHNidP8BALgCAAAAAAGcNLQPfOgeLHmAL9aD8x2ZXoKLYDwo1EyQWsEhvHrItQEAAAAA/////wIB2ZZIqhJ8l9HAN9Wmk7RP0PAbD5EX5bJzXsg+Dtkj8RgBAAAAAAAPQkAAFgAUtZnvXT8WwuHbM2bzjhsva7dKm+wB2ZZIqhJ8l9HAN9Wmk7RP0PAbD5EX5bJzXsg+Dtkj8RgBAAAAASn2r8AAFgAURiC6Gk38G3uFA7N+nr6s9nVyKvoAAAAAAAEBQgHZlkiqEnyX0cA31aaTtE/Q8BsPkRflsnNeyD4O2SPxGAEAAAABKgXyAAAWABRGILoaTfwbe4UDs36evqz2dXIq+gAAAA==";
  const API_URL = "https://liquid-taxi.herokuapp.com/order"
  const doc = document
  const rootEl = doc.documentElement
  const body = doc.body
  const fetch = window.fetch
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
    const psbt = document.getElementById("tx-input").value;

    if (psbt.length < 30)
      return alert("Not valid PSBT");
    
    //Hide the form and show the loader
    document.getElementById("request-invoice").style.display = "none";
    document.getElementById("loader").style.display = "block";

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ psbt })
    })
      .then(response => response.json())
      .then(res => {
        if (!res || !res.success || !res.data || !res.data.id)
          throw new Error("Not a valid PSBT");

        const orderId = res.data.id;

        return fetch(`${API_URL}/${orderId}`)
      })
      .then(response => response.json())
      .then(res => {
        if (!res || !res.success || !res.data || !res.data.lightningInvoice)
          throw new Error("System error");

        const orderId = res.data._id;
        const paymentRequest = res.data.lightningInvoice.payreq;
        const { fees, spread, total } = res.data.breakdown;

        document.getElementById("loader").style.display = "none";
        document.getElementById("invoice").style.display = "block";

        document.getElementById("invoice-input").value = paymentRequest;
        document.getElementById("fees-text").innerHTML = `fees ${fees} | spread ${spread} | Total ${total}`;
        document.getElementById("hash-text").innerHTML =
          `<a target="_blank" href="${API_URL}/${orderId}">${orderId}</a>`;
        document.getElementById("qr-image").src =
          "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + paymentRequest;

      })
      .catch(err => {
        console.error(err);

        //Show the form again and hide loader and invoice 
        document.getElementById("request-invoice").style.display = "block";
        document.getElementById("loader").style.display = "none";
        document.getElementById("invoice").style.display = "none";

        alert('Something went wrong. Try again')
      })

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

  function onCopyNodeUriClik(event) {
    event.preventDefault();
    //COpy to clipboard
    copy("02eadbd9e7557375161df8b646776a547c5cbc2e95b3071ec81553f8ec2cea3b8c@18.191.253.246:9735");
  }

  function onUseSampleClik(event) {
    event.preventDefault();
    document.getElementById("tx-input").value = SAMPLE_RAW_TX;
  }

  document.getElementById("use-sample-button").addEventListener("click", onUseSampleClik);
  document.getElementById("topup-button").addEventListener("click", onButtonClik);
  document.getElementById("copy-invoice-button").addEventListener("click", onCopyClik);
  document.getElementById("copy-node-uri").addEventListener("click", onCopyNodeUriClik);



}())
