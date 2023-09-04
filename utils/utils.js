const RelativeTime = require('./RelativeTime');

async function timeAgo(timestamp) {
    const relativeTime = new RelativeTime({
        locale: 'en',
    });

    return relativeTime.from(new Date(timestamp * 1000));
}

module.exports = {
    timeAgo
};