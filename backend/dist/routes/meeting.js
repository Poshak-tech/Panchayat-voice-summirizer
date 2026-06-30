"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meeting_1 = require("../controllers/meeting");
const egramSwaraj_1 = require("../services/egramSwaraj");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes here are protected by JWT Auth
router.use(auth_1.authenticateJWT);
router.post('/', meeting_1.createMeeting);
router.get('/', meeting_1.getMeetings);
router.get('/stats', meeting_1.getDashboardStats);
router.get('/:id', meeting_1.getMeetingDetails);
router.put('/action-items/:id', meeting_1.updateActionItemStatus);
// AI processing and chat
router.post('/:id/process', meeting_1.processMeeting);
router.post('/:id/chat', meeting_1.chatWithMeeting);
// Export route
router.get('/:id/export/:format', meeting_1.exportMeeting);
// eGramSwaraj integration endpoint
router.get('/egramswaraj/fetch', async (req, res) => {
    try {
        const panchayatName = req.user?.panchayat || 'Kalyanpur Gram Panchayat';
        const financialYear = req.query.financialYear || '2026-2027';
        const meetings = await (0, egramSwaraj_1.fetchEGramSwarajMeetings)(panchayatName, financialYear);
        res.json({ meetings });
    }
    catch (error) {
        console.error('Error fetching eGramSwaraj meetings:', error);
        res.status(500).json({ message: 'Error fetching eGramSwaraj data', error: error.message });
    }
});
exports.default = router;
