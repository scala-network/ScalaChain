const { getNetworkInfo, getMempoolSize, getTransaction } = require('./api');

async function getTxPageData(h) {
    let obj = {};

    const [
        networkInfo,
        sizeOfPool,
        txInfo
    ] = await Promise.all([
        getNetworkInfo(),
        getMempoolSize(),
        getTransaction(h)
    ])

    const confirmed = ((txInfo.data.current_height - txInfo.data.block_height) > 10)

    let [
        txStatus,
        paymentId,
        keyImagesInputHTML,
        keyImagesOutputHTML
    ] = [
        confirmed ? `<i class='fa fa-check no-margin' title="Confirmed"></i>` : `<i class='fa fa-clock' title="Unconfirmed"></i>`,
        "",
        "",
        ""
    ]

    if(txInfo.data.hasOwnProperty("title")) {
        if(txInfo.data.title.includes('Cant')) {
            return false
        }
    }

    if (txInfo.data.payment_id == '' && txInfo.data.payment_id8 == '') {
        paymentId += '<i class="fa fa-times" aria-hidden="true"></i>'
      } else {
        if (txInfo.data.payment_id !== '') {
          paymentId += `<span>${txInfo.data.payment_id}</span>`
        } else {
          paymentId += `<span>${txInfo.data.payment_id8}</span>`
        }
    }

    for(const one of txInfo.data.inputs) {
        keyImagesInputHTML += `<tr><td>?</td><td>${one.key_image}</td></tr>`
    }

    for(const one of txInfo.data.outputs) {
        keyImagesOutputHTML += `<tr><td>?</td><td>${one.public_key}</td></tr>`
    }

    obj.tx_hash = txInfo.data.tx_hash;
    obj.mixins = txInfo.data.mixin;
    obj.tx_status = txStatus;
    obj.tx_extra = txInfo.data.extra;
    obj.payment_id = paymentId;
    obj.rct_type = txInfo.data.rct_type;
    obj.timestamp = txInfo.data.timestamp;
    obj.timestamp_utc = txInfo.data.timestamp_utc;
    obj.tx_fee = `${(txInfo.data.tx_fee / 100)} XLA`;
    obj.tx_size = `${(txInfo.data.tx_size / 1000).toFixed(2)} kb`;
    obj.tx_version = txInfo.data.tx_version;
    obj.key_image_inputs = keyImagesInputHTML;
    obj.key_image_outputs = keyImagesOutputHTML;
    obj.stat_block_height = networkInfo.data.height;
    obj.stat_block_difficulty = networkInfo.data.difficulty;
    obj.stat_block_hashrate = (((networkInfo.data.difficulty) / 120) / 1000000).toFixed(2);
    obj.stat_txcount = networkInfo.data.tx_count;
    obj.stat_tx_pool_size = networkInfo.data.tx_pool_size;
    obj.tx_pool_data_size = sizeOfPool;
    obj.stat_incom = networkInfo.data.incoming_connections_count;
    obj.stat_outgo = networkInfo.data.outgoing_connections_count;
    
    return obj;
}

module.exports = {
    getTxPageData
}