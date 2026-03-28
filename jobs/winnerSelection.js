const cron = require('node-cron');
const db = require('../config/db');

cron.schedule('1 0 * * *', async () => {
    console.log("------------------- Starting Midnight Winner Selection");
    try {
        const today = new Date().toISOString().split('T')[0];

        const [bids] = await db.query(
            'SELECT id, user_id, bid_amount FROM bids WHERE target_date = ? ORDER BY bid_amount DESC LIMIT 1',
            [today]
        );

        if (bids.length > 0) {
            const winningBidId = bids[0].id;

            await db.query('UPDATE bids SET status = "won" WHERE id = ?', [winningBidId]);

            await db.query('UPDATE bids SET status = "lost" WHERE target_date = ? AND id != ?', [today, winningBidId]);

            console.log(`------------------- Winner selected for ${today}! User ID: ${bids[0].user_id} with £${bids[0].bid_amount}`);
        } else {
            console.log(`------------------- No bids found for ${today}.`);
        }
    } catch (error) {
        console.error("------------------- Error in winner selection cron job:", error);
    }
});

console.log("------------------- Winner Selection Cron Job loaded and waiting for midnight");