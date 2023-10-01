const { getNetworkInfo, getMempoolSize, getBlockRange, getBlock } = require('./api');
const { timeAgo } = require('../utils/utils');

async function getIndexData() {
    let obj = {};
    const [
        networkInfo,
        sizeOfPool
    ] = await Promise.all([
        getNetworkInfo(),
        getMempoolSize()
    ])

    let [
        tenBlocksHTML,
        transactionsHTML,
        lastHashHTML
    ] = [
        "",
        "",
        ""
    ];

    const lastHeight = (networkInfo.data.height != undefined) ? networkInfo.data.height - 1 : 0;
    const lastBlockInfo = await getBlock(lastHeight);

    obj.block_height = (networkInfo.data.height != undefined) ? networkInfo.data.height : 0;
    obj.difficulty_current = (networkInfo.data.difficulty != undefined) ? networkInfo.data.difficulty : 0;
    obj.hashrate_current = (networkInfo.data.difficulty != undefined) ? (((networkInfo.data.difficulty) / 120) / 1000000).toFixed(2) : 0;
    obj.pool_tx_count = (networkInfo.data.tx_pool_size != undefined) ? networkInfo.data.tx_pool_size : 0;
    obj.tx_pool_data_size = (sizeOfPool).toFixed(2);
    obj.transaction_count = (networkInfo.data.tx_count != undefined) ? networkInfo.data.tx_count : 0;
    obj.incoming_conn_count = (networkInfo.data.incoming_connections_count != undefined) ? networkInfo.data.incoming_connections_count : 0;
    obj.outgoing_conn_count = (networkInfo.data.outgoing_connections_count != undefined) ? networkInfo.data.outgoing_connections_count : 0;
    obj.last_hash_top = (lastBlockInfo.result.block_header.hash != undefined) ? lastBlockInfo.result.block_header.hash : 0;
    obj.last_block_height_top = (lastBlockInfo.result.block_header.height != undefined) ? lastBlockInfo.result.block_header.height : 0;
    obj.last_block_reward = (lastBlockInfo.result.block_header.reward !== undefined) ? ((lastBlockInfo.result.block_header.reward / 100)).toFixed(2) : 0;
    obj.last_block_difficulty = (lastBlockInfo.result.block_header.difficulty != undefined) ? lastBlockInfo.result.block_header.difficulty : 0;
    obj.last_block_when = (lastBlockInfo.result.block_header.timestamp != undefined) ? await timeAgo(lastBlockInfo.result.block_header.timestamp) : 0;
    obj.last_block_txs_count = (networkInfo.data.last_block_tx_count != undefined) ? networkInfo.data.last_block_tx_count : 0;

    if(obj.last_hash_top != 0) {
        lastHashHTML =
        `
        <td>
            <a href="/block/${obj.last_hash_top}">${obj.last_hash_top.substring(0, 5)}...${obj.last_hash_top.substring(obj.last_hash_top.length - 5)}</a>
        </td>
        `
    }

    obj.last_hash_top_html = lastHashHTML;

    const transactionsCount = (lastBlockInfo.result.block_header.num_txes != undefined) ? lastBlockInfo.result.block_header.num_txes : 0;
    let lastBlockTxHashes = [];

    if(transactionsCount > 0) {
        lastBlockTxHashes = lastBlockInfo.result.tx_hashes
    }

    if(obj.block_height != 0) {
        if((lastHeight - 11) > 0) {
            const tB = await getBlockRange((lastHeight - 11), (lastHeight - 1))
            const tBh = (tB.result.headers).reverse()

            tenBlocksHTML = `<tbody id='txBody2'>`

            for(let i = 0; i < tBh.length; i++) {
                const current = tBh[i]
                const hLink = `/block?block_info=${current.hash}`

                tenBlocksHTML += 
                `
                <tr>
                    <td>
                        <a href="${hLink}">${current.hash.substring(0, 5)}...${current.hash.substring(current.hash.length - 5)}</a>
                    </td>
                    <td>
                        ${current.height}
                    </td>
                    <td>
                        ${(current.reward / 100).toFixed(2)}
                    </td>
                    <td>
                        ${(current.difficulty)}
                    </td>
                    <td>
                        ${await timeAgo(current.timestamp)}
                    </td>
                    <td class='t-right'>
                        ${(current.num_txes)}
                    </td>
                </tr>
                `
            }
        }
    }

    if (transactionsCount > 0) {
        transactionsHTML = 
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
            transactionsHTML +=
            `
            <tr>
                <td>
                    ${current}
                </td>
                <td>
                    ${lastHeight + 10}
                </td>
                <td class='t-right c-green'>
                    <i class='fas fa-check no-margin'></i>
                </td>
            </tr>
            `
        }

        transactionsHTML += `</tbody>`
    } else {
        transactionsHTML = `<thead><tr><th>No Transactions in the last block</th></tr></thead>`
    }

    obj.prev_blocks_html = tenBlocksHTML;
    obj.last_blocks_transactions = transactionsHTML;

    return obj;
}

module.exports = {
    getIndexData
}