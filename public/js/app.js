function goSearch () {
    const variable = document.getElementById('chain_data').value
    const input = variable.replace(/[^a-z0-9]/gi, '')

    if (!isNaN(input)) {
      location.href = `/block/${input}`
    } else {
      location.href = `/search/${input}`
    }
}

$('#chain_data').on('keypress', function (e) {
    if (e.which == 13) {
      goSearch()
    }
})

async function toastMessage (type, message, time, width = undefined) {
    const response = await Swal.fire({
      icon: type,
      title: message,
      showConfirmButton: true,
      timer: time,
      timerProgressBar: true,
      width: '400px',
      background: '#1b1e24',
      confirmButtonColor: '#2465ff',
    })
  
    return response
}

$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')

    let msg = "";
    let urlState = "";

    if(error === 'not_found') {
        msg = "Nothing found for your search";
    } else if (error === 'not_found_tx') {
        const tx = urlParams.get('tx')
        urlState = `/tx/${tx}`
        msg = "Transaction not found";
      } else if (error === 'not_found_block') {
        const block = urlParams.get('block')
        urlState = `/block/${block}`
        msg = "Block not found";
    }
    
    if(msg !== "") {
        await toastMessage('error', msg, 3000)
        if(urlState !== ""){
          window.history.replaceState(null, null, urlState)
        }
    }

    $('#methodOne').click(async function() {
      const tx_hash = $("#tx_hash_1").val();
      const key = $("#tx_key").val();
      const address = $("#rec_1").val();

      const res = await (await fetch('/prove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({tx_hash: tx_hash, key:key, address:address, method:0})
      })).json();

      if(res.proven === true) {
        await toastMessage('success', `The transaction is verified for given keys`, 3000)
      } else {
        await toastMessage('error', `The transaction cannot be verified for given data`, 3000)
      }
    });

    $('#methodTwo').click(async function() {
      const tx_hash = $("#tx_hash_2").val();
      const key = $("#view_key").val();
      const address = $("#rec_2").val();

      const res = await (await fetch('/prove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({tx_hash: tx_hash, key:key, address:address, method:1})
      })).json();

      if(res.proven === true) {
        await toastMessage('success', `The transaction is verified for given keys`, 3000)
      } else {
        await toastMessage('error', `The transaction cannot be verified for given data`, 3000)
      }
    });
})