const { getNetworkInfo, getMempoolSize, getBlock } = require('./api');
const { timeAgo } = require('../utils/utils');

async function getBlockPageData(h) {
    let obj = {};

    const [
        blockInfo,
        networkInfo,
        sizeOfPool
    ] = await Promise.all([
        getBlock(h),
        getNetworkInfo(),
        getMempoolSize()
    ])

    if(blockInfo.hasOwnProperty("error")) {
        if(blockInfo.error.hasOwnProperty("code")) {
            return false;
        }
    }

    const transactionsCount = blockInfo.result.block_header.num_txes;
    const lastBlockTxHashes = blockInfo.result.tx_hashes

    let blockTxsHTML = "";

    if(transactionsCount > 0) {
        blockTxsHTML += 
        `
            <thead>
                <tr>
                    <th>Transaction hash</th>
                    <th>Unlock Block</th>
                    <th class='t-right'>Status</th>
                </tr>
            </thead>
            <tbody>
        `

        for(let i = 0; i < lastBlockTxHashes.length; i++) {
            const current = lastBlockTxHashes[i]
            blockTxsHTML += 
            `
            <tr>
                <td>${current}</td>
                <td>${blockInfo.result.block_header.height + 10}</td>
                <td class='t-right c-green'>
                    <i class='fas fa-check no-margin'></i>
                </td>
            </tr>
            `
        }

        blockTxsHTML += `</tbody>`
    } else {
        blockTxsHTML = `<thead><tr><th>No Transactions in this block</th></tr></thead>`
    }

    obj.block_hash = blockInfo.result.block_header.hash;

    let block_hash_html = 
    `
    <td>
        <a href="/block/${obj.block_hash}">${obj.block_hash.substring(0, 5)}...${obj.block_hash.substring(obj.block_hash.length - 5)}</a>
    </td>
    `;

    obj.block_hash_html = block_hash_html;
    obj.block_height = blockInfo.result.block_header.height;
    obj.block_reward = ((blockInfo.result.block_header.reward) / 100);
    obj.difficulty = blockInfo.result.block_header.difficulty;
    obj.time_ago = await timeAgo(blockInfo.result.block_header.timestamp);
    obj.time_stamp = blockInfo.result.block_header.timestamp;
    obj.tx_count = transactionsCount;
    obj.inblock_txs = blockTxsHTML;
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
    getBlockPageData
}