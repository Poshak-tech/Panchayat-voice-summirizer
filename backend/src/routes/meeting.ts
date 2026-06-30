import { Router } from 'express';
import {
  createMeeting,
  getMeetings,
  getMeetingDetails,
  updateActionItemStatus,
  getDashboardStats,
  processMeeting,
  chatWithMeeting,
  exportMeeting,
} from '../controllers/meeting';
import { fetchEGramSwarajMeetings } from '../services/egramSwaraj';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// All routes here are protected by JWT Auth
router.use(authenticateJWT);

router.post('/', createMeeting);
router.get('/', getMeetings);
router.get('/stats', getDashboardStats);
router.get('/:id', getMeetingDetails);
router.put('/action-items/:id', updateActionItemStatus);

// AI processing and chat
router.post('/:id/process', processMeeting);
router.post('/:id/chat', chatWithMeeting);

// Export route
router.get('/:id/export/:format', exportMeeting);

// eGramSwaraj integration endpoint
router.get('/egramswaraj/fetch', async (req: any, res) => {
  try {
    const panchayatName = req.user?.panchayat || 'Kalyanpur Gram Panchayat';
    const financialYear = (req.query.financialYear as string) || '2026-2027';
    
    const meetings = await fetchEGramSwarajMeetings(panchayatName, financialYear);
    res.json({ meetings });
  } catch (error: any) {
    console.error('Error fetching eGramSwaraj meetings:', error);
    res.status(500).json({ message: 'Error fetching eGramSwaraj data', error: error.message });
  }
});

export default router;
