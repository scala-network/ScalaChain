const cron = require('node-cron');

const EXPLORER_API = process.env.EXPLORER_API;
const NODE_RPC = process.env.NODE_RPC;

let cachedNetworkInfo = null;
let cachedMemPoolSize = null;

cron.schedule('*/1 * * * *', async () => {
    cachedNetworkInfo = await (await (fetch (`${EXPLORER_API}/api/networkinfo`))).json();
    cachedMemPoolSize = await getMempoolSizeIn();
})

/* Warm up the cache */
setTimeout(async () => {
    cachedNetworkInfo = await (await (fetch (`${EXPLORER_API}/api/networkinfo`))).json();
    cachedMemPoolSize = await getMempoolSizeIn();
}, 0)

async function getNetworkInfo () {
    return cachedNetworkInfo;
}

async function getTransaction (txHash) {
    return (await (fetch (`${EXPLORER_API}/api/transaction/${txHash}`))).json();
}

async function getMempoolSizeIn () {
    const memPool = await (await fetch (`${EXPLORER_API}/api/mempool`)).json()
    const memPoolTxs = memPool.data.txs
    const memPoolTxCount = memPool.data.txs_no
    let sizeOfPool = 0
  
    if (memPoolTxCount !== 0) {
      for (let i = 0; i < memPoolTxCount; i++) {
        sizeOfPool += memPoolTxs[i].tx_size
      }
      return (sizeOfPool / 1000)
    } else {
      return 0
    }
}

async function getMempoolSize () {
    if(cachedMemPoolSize === null) {
        return 0
    }

    return cachedMemPoolSize;
}

async function getBlockRange (startHeight, endHeight) {
    const res = await (await fetch(`${NODE_RPC}/json_rpc`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: '0', method: 'get_block_headers_range', params: { start_height: startHeight, end_height: endHeight } })
    })).json();

    return res;
}

async function getBlock (h) {
    const p = (isNaN(h) === true) ? { hash: h } : { height: h };
    const res = await (await fetch(`${NODE_RPC}/json_rpc`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: '0', method: 'get_block', params: p })
    })).json();

    return res;
}

async function isBlock (data) {
    const g = await getBlock(data)
    if(g.hasOwnProperty('error')) {
        return false
    }

    return true
}

async function isTx(data) {
    const res = await (await fetch(`${EXPLORER_API}/api/transaction/${data}`)).json();
    if(res.hasOwnProperty('status')) {
        if(res.status === 'fail') {
            return false
        }
    }

    return true
}

async function proveTransacion (txHash, address, key, method) {
    try {
        const res = await (await fetch(`${EXPLORER_API}/api/outputs?txhash=${txHash}&address=${address}&viewkey=${key}&txprove=${method}`)).json();
        if(res.status !== 'error' && res.status !== 'fail') {
            if(res.data.tx_prove === true) {
                return true
            }
            return false
        }
    
        return false   
    } catch (error) {
        return false
    }
}

module.exports = {
    getNetworkInfo,
    getTransaction,
    getMempoolSize,
    getBlockRange,
    getBlock,
    isBlock,
    isTx,
    proveTransacion
}