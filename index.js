require('dotenv').config();

const path = require('path');

const express = require('express');
const app = express();
const bodyParser = require('body-parser')

const { getIndexData } = require('./services/index');
const { getBlockPageData } = require('./services/block');
const { getTxPageData } = require('./services/tx');
const { isBlock, isTx, proveTransacion } = require('./services/api');

app.use(express.static('public'));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

app.get('/', async (req, res) => {
    const indexData = await getIndexData();
    res.render('index', {
        block_height: indexData.block_height,
        difficulty_current: indexData.difficulty_current,
        hashrate_current: indexData.hashrate_current,
        transaction_count: indexData.transaction_count,
        pool_tx_count: indexData.pool_tx_count,
        tx_pool_data_size: indexData.tx_pool_data_size,
        incoming_conn_count: indexData.incoming_conn_count,
        outgoing_conn_count: indexData.outgoing_conn_count,
        last_hash_top: indexData.last_hash_top,
        last_hash_top_html: indexData.last_hash_top_html,
        last_block_height_top: indexData.last_block_height_top,
        last_block_reward: indexData.last_block_reward,
        last_block_reward_diardi: indexData.last_block_reward_diardi,
        last_block_difficulty: indexData.last_block_difficulty,
        last_block_when: indexData.last_block_when,
        last_block_txs_count: indexData.last_block_txs_count,
        last_blocks_transactions_html: indexData.last_blocks_transactions,
        prev_blocks_html: indexData.prev_blocks_html
    });
});

app.get(['/block', '/block/:hash', /^\/block\.html/], async (req, res) => {
    let blockInfo;

    if (req.query.block_info) {
        blockInfo = req.query.block_info;
    }

    if (req.params.hash) {
        blockInfo = req.params.hash;
    }

    if (req.originalUrl.includes('block.html')) {
        blockInfo = req.originalUrl.split('?hash=')[1];
    }

    if(!blockInfo) {
        res.redirect('/');
        return;
    }

    const blockData = await getBlockPageData(blockInfo);

    if(blockData == false) {
        res.redirect(`/?error=not_found_block&block=${blockInfo}`);
        return;
    }

    res.render('block', {
        block_hash: blockData.block_hash,
        block_hash_html: blockData.block_hash_html,
        block_height: blockData.block_height,
        block_reward: blockData.block_reward,
        difficulty: blockData.difficulty,
        time_ago: blockData.time_ago,
        time_stamp: blockData.time_stamp,
        tx_count: blockData.tx_count,
        inblock_txs: blockData.inblock_txs,
        stat_block_height: blockData.stat_block_height,
        stat_block_difficulty: blockData.stat_block_difficulty,
        stat_block_hashrate: blockData.stat_block_hashrate,
        stat_txcount: blockData.stat_txcount,
        stat_tx_pool_size: blockData.stat_tx_pool_size,
        tx_pool_data_size: blockData.tx_pool_data_size,
        stat_incom: blockData.stat_incom,
        stat_outgo: blockData.stat_outgo
    });
})

app.get(['/tx', '/tx/:hash', /^\/tx\.html/], async (req, res) => {
    let txInfo;

    if (req.query.tx_info) {
        txInfo = req.query.tx_info;
    }

    if (req.params.hash) {
        txInfo = req.params.hash;
    }

    if (req.originalUrl.includes('tx.html')) {
        txInfo = req.originalUrl.split('&hash=')[1];
    }

    if(!txInfo) {
        res.redirect('/');
        return;
    }

    const txData = await getTxPageData(txInfo);

    if(txData == false) {
        res.redirect(`/?error=not_found_tx&tx=${txInfo}`);
        return;
    }

    res.render('tx', {
        tx_hash: txData.tx_hash,
        mixins: txData.mixins,
        tx_status: txData.tx_status,
        tx_extra: txData.tx_extra,
        payment_id: txData.payment_id,
        rct_type: txData.rct_type,
        timestamp: txData.timestamp,
        timestamp_utc: txData.timestamp_utc,
        tx_fee: txData.tx_fee,
        tx_size: txData.tx_size,
        tx_version: txData.tx_version,
        key_image_inputs: txData.key_image_inputs,
        key_image_outputs: txData.key_image_outputs,
        stat_block_height: txData.stat_block_height,
        stat_block_difficulty: txData.stat_block_difficulty,
        stat_block_hashrate: txData.stat_block_hashrate,
        stat_txcount: txData.stat_txcount,
        stat_tx_pool_size: txData.stat_tx_pool_size,
        tx_pool_data_size: txData.tx_pool_data_size,
        stat_incom: txData.stat_incom,
        stat_outgo: txData.stat_outgo
    });
});

app.get(['/search/:data'], async (req, res) => {
    const data = req.params.data;
    const [
        b,
        t
    ] = await Promise.all([
        isBlock(data),
        isTx(data)
    ]);

    if (!b && !t) {
        res.redirect(`/?error=not_found&data=${data}`);
        return;
    }

    if (b) {
        res.redirect(`/block/${data}`);
        return;
    }

    if (t) {
        res.redirect(`/tx/${data}`);
        return;
    }
});

app.post('/prove', async (req, res) => {
    const proof = await proveTransacion(req.body.tx_hash, req.body.address, req.body.key, req.body.method)
    res.send({
        proven: proof
    });
})

app.get('/prove', (req, res) => {
    res.render('prove');
});

app.listen(process.env.PORT, () => {
    console.log(`ScalaChain listening on port ${process.env.PORT}!`);
})