const Room = require('../models/Room');
const RoomUserPostLog = require('../models/RoomUserPostLog');

/**
 * Get the logical day string (YYYY-MM-DD) based on KST cutoff.
 */
function getLogicalDay(date = new Date(), cutoffHourKST = 3) {
    const utcOffsetHours = -9; // KST is UTC+9
    const cutoffUTC = cutoffHourKST - utcOffsetHours;

    const currentUTC = date.getUTCHours();
    const isBeforeCutoff = currentUTC < cutoffUTC;

    const logicalDate = new Date(date);
    if (isBeforeCutoff) {
        logicalDate.setUTCDate(date.getUTCDate() - 1);
    }

    return logicalDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

async function updateRoomStreakIfEligible({ userId, roomId }) {
    const room = await Room.findById(roomId);
    if (!room) return;

    const logicalDay = getLogicalDay(new Date(), room.cutoffHourKST || 3);

    // Create post log for today if not exists
    try {
        await RoomUserPostLog.create({
            roomId,
            userId,
            date: logicalDay,
        });
    } catch (err) {
        if (err.code !== 11000) { // ignore duplicate key error
            console.error('Error creating post log:', err);
            return;
        }
    }

    // Get all users who posted today
    const logsToday = await RoomUserPostLog.find({ roomId, date: logicalDay });
    const uniquePosters = new Set(logsToday.map(log => log.userId.toString()));
    const memberIds = room.members.map(m => m.toString());

    const allPosted = memberIds.every(id => uniquePosters.has(id));
    const alreadyCounted = room.lastStreakDate === logicalDay;

    console.log('[DEBUG] Room ID:', roomId);
    console.log('[DEBUG] Logical day:', logicalDay);
    console.log('[DEBUG] Member IDs:', memberIds);
    console.log('[DEBUG] Posters today:', Array.from(uniquePosters));

    if (allPosted && !alreadyCounted) {
        console.log('✅ All members posted today — updating streak!');
        room.collectiveStreakCount += 1;
        room.lastStreakDate = logicalDay;

        room.streakHistory.push({
            date: logicalDay,
            success: true,
            userIds: Array.from(uniquePosters),
        });

        await room.save();
        console.log('✅ Room updated:', room.collectiveStreakCount);

        console.log(`✅ Room ${room._id} streak incremented to ${room.collectiveStreakCount}`);
    }
}

module.exports = {
    getLogicalDay,
    updateRoomStreakIfEligible,
};
