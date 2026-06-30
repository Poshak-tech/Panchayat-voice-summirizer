"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportMeeting = exports.chatWithMeeting = exports.processMeeting = exports.getDashboardStats = exports.updateActionItemStatus = exports.getMeetingDetails = exports.getMeetings = exports.createMeeting = void 0;
const db_1 = __importDefault(require("../db"));
const ai_1 = require("../services/ai");
// Create a new meeting record
const createMeeting = async (req, res) => {
    try {
        const { title, description, date, panchayatName, villageName, meetingType, financialYear, agenda, participants, } = req.body;
        if (!title || !date || !panchayatName || !villageName || !meetingType || !financialYear || !agenda) {
            return res.status(400).json({ message: 'Missing required meeting details' });
        }
        const meeting = await db_1.default.meeting.create({
            data: {
                title,
                description,
                date: new Date(date),
                panchayatName,
                villageName,
                meetingType,
                financialYear,
                agenda,
                participants: typeof participants === 'string' ? participants : JSON.stringify(participants || []),
                status: 'PENDING',
                creatorId: req.user?.id || null,
            },
        });
        res.status(201).json({ meeting });
    }
    catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ message: 'Error creating meeting', error: error.message });
    }
};
exports.createMeeting = createMeeting;
// Get list of meetings with search and filters
const getMeetings = async (req, res) => {
    try {
        const { search, villageName, meetingType, financialYear } = req.query;
        const whereClause = {};
        // Filter by user's panchayat if not admin
        if (req.user?.role !== 'ADMIN' && req.user?.panchayat) {
            whereClause.panchayatName = req.user.panchayat;
        }
        if (villageName) {
            whereClause.villageName = String(villageName);
        }
        if (meetingType) {
            whereClause.meetingType = String(meetingType);
        }
        if (financialYear) {
            whereClause.financialYear = String(financialYear);
        }
        if (search) {
            const searchStr = String(search);
            whereClause.OR = [
                { title: { contains: searchStr } },
                { description: { contains: searchStr } },
                { agenda: { contains: searchStr } },
                { villageName: { contains: searchStr } },
            ];
        }
        const meetings = await db_1.default.meeting.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            include: {
                creator: {
                    select: { name: true, role: true },
                },
                actionItems: true,
            },
        });
        // Parse participants JSON for each meeting
        const formattedMeetings = meetings.map((m) => ({
            ...m,
            participants: JSON.parse(m.participants || '[]'),
        }));
        res.json({ meetings: formattedMeetings });
    }
    catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Error fetching meetings', error: error.message });
    }
};
exports.getMeetings = getMeetings;
// Get a single meeting's complete details
const getMeetingDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const meeting = await db_1.default.meeting.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { name: true, role: true },
                },
                transcript: true,
                summary: true,
                actionItems: true,
            },
        });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        // Parse JSON fields
        const formattedMeeting = {
            ...meeting,
            participants: JSON.parse(meeting.participants || '[]'),
            transcript: meeting.transcript
                ? {
                    ...meeting.transcript,
                    segments: JSON.parse(meeting.transcript.segments || '[]'),
                }
                : null,
            summary: meeting.summary
                ? {
                    ...meeting.summary,
                    keyDiscussionPoints: JSON.parse(meeting.summary.keyDiscussionPoints || '[]'),
                    decisionsTaken: JSON.parse(meeting.summary.decisionsTaken || '[]'),
                    schemesMentioned: JSON.parse(meeting.summary.schemesMentioned || '[]'),
                    budgetDiscussions: JSON.parse(meeting.summary.budgetDiscussions || '[]'),
                    problemsRaised: JSON.parse(meeting.summary.problemsRaised || '[]'),
                    citizenRequests: JSON.parse(meeting.summary.citizenRequests || '[]'),
                }
                : null,
        };
        res.json({ meeting: formattedMeeting });
    }
    catch (error) {
        console.error('Error fetching meeting details:', error);
        res.status(500).json({ message: 'Error fetching meeting details', error: error.message });
    }
};
exports.getMeetingDetails = getMeetingDetails;
// Update status of a specific action item
const updateActionItemStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body; // PENDING, IN_PROGRESS, COMPLETED
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        const actionItem = await db_1.default.actionItem.update({
            where: { id },
            data: { status },
        });
        res.json({ actionItem });
    }
    catch (error) {
        console.error('Error updating action item:', error);
        res.status(500).json({ message: 'Error updating action item', error: error.message });
    }
};
exports.updateActionItemStatus = updateActionItemStatus;
// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
    try {
        const whereClause = {};
        // Filter by user's panchayat if not admin
        if (req.user?.role !== 'ADMIN' && req.user?.panchayat) {
            whereClause.panchayatName = req.user.panchayat;
        }
        const totalMeetings = await db_1.default.meeting.count({ where: whereClause });
        const actionItems = await db_1.default.actionItem.findMany({
            where: {
                meeting: whereClause,
            },
        });
        const totalActionItems = actionItems.length;
        const completedTasks = actionItems.filter((item) => item.status === 'COMPLETED').length;
        const pendingTasks = totalActionItems - completedTasks;
        // Retrieve all summaries to analyze scheme frequencies
        const summaries = await db_1.default.summary.findMany({
            where: {
                meeting: whereClause,
            },
            select: {
                schemesMentioned: true,
            },
        });
        // Calculate scheme frequencies
        const schemeCounts = {};
        summaries.forEach((sum) => {
            try {
                const schemes = JSON.parse(sum.schemesMentioned || '[]');
                schemes.forEach((sch) => {
                    const name = typeof sch === 'string' ? sch : sch.name;
                    if (name) {
                        schemeCounts[name] = (schemeCounts[name] || 0) + 1;
                    }
                });
            }
            catch (err) {
                // Ignore JSON parsing errors
            }
        });
        const schemeFrequency = Object.keys(schemeCounts)
            .map((name) => ({ name, count: schemeCounts[name] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        // If no schemes are present, provide a default list
        if (schemeFrequency.length === 0) {
            schemeFrequency.push({ name: 'MGNREGA', count: 0 }, { name: 'Jal Jeevan Mission', count: 0 }, { name: 'PM-AWAS Gramin', count: 0 }, { name: 'Swachh Bharat', count: 0 }, { name: 'PMGSY', count: 0 });
        }
        // Monthly meeting frequencies for the current year
        const meetings = await db_1.default.meeting.findMany({
            where: whereClause,
            select: { date: true },
        });
        const monthlyCounts = {
            Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
            Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
        };
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        meetings.forEach((m) => {
            const date = new Date(m.date);
            const monthIndex = date.getMonth();
            const monthName = monthNames[monthIndex];
            monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1;
        });
        const monthlyMeetings = Object.keys(monthlyCounts).map((month) => ({
            month,
            count: monthlyCounts[month],
        }));
        res.json({
            stats: {
                totalMeetings,
                totalActionItems,
                completedTasks,
                pendingTasks,
                schemeFrequency,
                monthlyMeetings,
            },
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
// --- NEW AI & EXPORT ENDPOINTS ---
// Process meeting audio (transcribe, summarize, create action items)
const processMeeting = async (req, res) => {
    try {
        const id = req.params.id;
        const meeting = await db_1.default.meeting.findUnique({ where: { id } });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        // Update status to PROCESSING
        await db_1.default.meeting.update({
            where: { id },
            data: { status: 'PROCESSING' },
        });
        // 1. Transcribe
        const audioPath = meeting.audioPath || '';
        const { text, segments } = await (0, ai_1.transcribeAudio)(audioPath, meeting.agenda, meeting.meetingType);
        // Save Transcript
        await db_1.default.transcript.create({
            data: {
                meetingId: id,
                text,
                segments: JSON.stringify(segments),
            },
        });
        // 2. Summarize
        const summaryData = await (0, ai_1.summarizeTranscript)(text, meeting.agenda);
        // Save Summary
        await db_1.default.summary.create({
            data: {
                meetingId: id,
                executiveSummary: summaryData.executiveSummary,
                keyDiscussionPoints: JSON.stringify(summaryData.keyDiscussionPoints),
                decisionsTaken: JSON.stringify(summaryData.decisionsTaken),
                schemesMentioned: JSON.stringify(summaryData.schemesMentioned),
                budgetDiscussions: JSON.stringify(summaryData.budgetDiscussions),
                problemsRaised: JSON.stringify(summaryData.problemsRaised),
                citizenRequests: JSON.stringify(summaryData.citizenRequests),
            },
        });
        // 3. Create Action Items
        if (summaryData.actionItems && summaryData.actionItems.length > 0) {
            const actionItemsToCreate = summaryData.actionItems.map((item) => {
                const deadlineDate = new Date();
                deadlineDate.setDate(deadlineDate.getDate() + (item.deadlineDays || 7));
                return {
                    meetingId: id,
                    task: item.task,
                    responsibleOfficer: item.responsibleOfficer,
                    priority: item.priority || 'MEDIUM',
                    status: 'PENDING',
                    deadline: deadlineDate,
                };
            });
            await db_1.default.actionItem.createMany({
                data: actionItemsToCreate,
            });
        }
        // Update status to COMPLETED
        const updatedMeeting = await db_1.default.meeting.update({
            where: { id },
            data: { status: 'COMPLETED' },
        });
        res.json({ message: 'Meeting processed successfully', meeting: updatedMeeting });
    }
    catch (error) {
        console.error('Error processing meeting:', error);
        // Reset status to FAILED on error
        await db_1.default.meeting.update({
            where: { id: req.params.id },
            data: { status: 'FAILED' },
        }).catch(() => { });
        res.status(500).json({ message: 'Error processing meeting', error: error.message });
    }
};
exports.processMeeting = processMeeting;
// Chat with meeting transcript
const chatWithMeeting = async (req, res) => {
    try {
        const id = req.params.id;
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }
        const transcript = await db_1.default.transcript.findUnique({ where: { meetingId: id } });
        if (!transcript) {
            return res.status(404).json({ message: 'Transcript not found for this meeting. Please process the meeting first.' });
        }
        const answer = await (0, ai_1.answerChatQuestion)(transcript.text, question);
        res.json({ answer });
    }
    catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ message: 'Error in chat assistant', error: error.message });
    }
};
exports.chatWithMeeting = chatWithMeeting;
// Export Meeting Minutes
const exportMeeting = async (req, res) => {
    try {
        const id = req.params.id;
        const { format } = req.params;
        const meeting = await db_1.default.meeting.findUnique({
            where: { id },
            include: {
                transcript: true,
                summary: true,
                actionItems: true,
            },
        });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        // Parse JSON fields
        const parsedParticipants = JSON.parse(meeting.participants || '[]');
        const parsedDecisions = meeting.summary ? JSON.parse(meeting.summary.decisionsTaken || '[]') : [];
        const parsedPoints = meeting.summary ? JSON.parse(meeting.summary.keyDiscussionPoints || '[]') : [];
        const parsedSchemes = meeting.summary ? JSON.parse(meeting.summary.schemesMentioned || '[]') : [];
        const parsedBudgets = meeting.summary ? JSON.parse(meeting.summary.budgetDiscussions || '[]') : [];
        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="Meeting_Minutes_${meeting.id}.json"`);
            return res.send(JSON.stringify(meeting, null, 2));
        }
        if (format === 'excel') {
            // Export action items as CSV
            let csvContent = 'Task,Responsible Officer,Deadline,Priority,Status\n';
            meeting.actionItems.forEach((item) => {
                const deadlineStr = item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN') : 'N/A';
                // Escape commas for CSV safety
                const taskEscaped = `"${item.task.replace(/"/g, '""')}"`;
                const officerEscaped = `"${item.responsibleOfficer.replace(/"/g, '""')}"`;
                csvContent += `${taskEscaped},${officerEscaped},${deadlineStr},${item.priority},${item.status}\n`;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="Action_Items_${meeting.id}.csv"`);
            return res.send(csvContent);
        }
        if (format === 'word' || format === 'pdf') {
            // Generate styled HTML (which Word can open as doc, and browsers can print/save as PDF)
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Minutes of Meeting - ${meeting.title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px; }
    .emblem { font-size: 24px; font-weight: bold; color: #1e3a8a; margin-bottom: 5px; }
    .subtitle { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 22px; color: #111; text-align: center; margin-top: 20px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .meta-table td { padding: 8px; border: 1px solid #ddd; font-size: 13px; }
    .meta-label { font-weight: bold; background-color: #f9f9f9; width: 25%; }
    h2 { font-size: 16px; color: #1e3a8a; border-bottom: 1px solid #1e3a8a; padding-bottom: 5px; margin-top: 30px; }
    p, li { font-size: 13px; text-align: justify; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    .budget-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .budget-table th, .budget-table td { padding: 8px; border: 1px solid #ddd; font-size: 12px; text-align: left; }
    .budget-table th { background-color: #f2f2f2; }
    .footer-signatures { margin-top: 50px; display: flex; justify-content: space-between; }
    .signature-box { text-align: center; width: 40%; border-top: 1px solid #333; padding-top: 8px; font-size: 12px; font-weight: bold; margin-top: 50px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="emblem">GOVERNMENT OF INDIA</div>
    <div class="subtitle">GRAM PANCHAYAT DEVELOPMENT SYSTEM</div>
    <h1>MINUTES OF MEETING</h1>
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Panchayat Name</td>
      <td>${meeting.panchayatName}</td>
      <td class="meta-label">Financial Year</td>
      <td>${meeting.financialYear}</td>
    </tr>
    <tr>
      <td class="meta-label">Meeting Title</td>
      <td colspan="3">${meeting.title}</td>
    </tr>
    <tr>
      <td class="meta-label">Date & Time</td>
      <td>${new Date(meeting.date).toLocaleString('en-IN')}</td>
      <td class="meta-label">Village / Venue</td>
      <td>${meeting.villageName}</td>
    </tr>
    <tr>
      <td class="meta-label">Meeting Type</td>
      <td>${meeting.meetingType}</td>
      <td class="meta-label">Status</td>
      <td>${meeting.status}</td>
    </tr>
  </table>

  <h2>1. Official Agenda</h2>
  <p>${meeting.agenda}</p>

  <h2>2. Participants</h2>
  <ul>
    ${parsedParticipants.map((p) => `<li>${p}</li>`).join('')}
  </ul>

  <h2>3. Executive Summary</h2>
  <p>${meeting.summary ? meeting.summary.executiveSummary : 'N/A'}</p>

  <h2>4. Key Decisions & Resolutions</h2>
  <ul>
    ${parsedDecisions.map((d) => `<li><strong>RESOLVED THAT:</strong> ${d}</li>`).join('')}
    ${parsedDecisions.length === 0 ? '<li>No specific resolutions recorded.</li>' : ''}
  </ul>

  <h2>5. Discussion Points</h2>
  <ul>
    ${parsedPoints.map((p) => `<li>${p}</li>`).join('')}
  </ul>

  ${parsedBudgets.length > 0
                ? `
  <h2>6. Financial Allocations & Budget Discussions</h2>
  <table class="budget-table">
    <thead>
      <tr>
        <th>Project / Purpose</th>
        <th>Budget Amount</th>
        <th>Source / Context</th>
      </tr>
    </thead>
    <tbody>
      ${parsedBudgets
                    .map((b) => `
      <tr>
        <td>${b.purpose}</td>
        <td><strong>₹${b.amount.toLocaleString('en-IN')}</strong></td>
        <td>${b.context}</td>
      </tr>`)
                    .join('')}
    </tbody>
  </table>`
                : ''}

  ${parsedSchemes.length > 0
                ? `
  <h2>7. Government Schemes Discussed</h2>
  <ul>
    ${parsedSchemes.map((s) => `<li><strong>${s.name}:</strong> ${s.context}</li>`).join('')}
  </ul>`
                : ''}

  <h2>8. Action Items and Responsibilities</h2>
  <table class="budget-table">
    <thead>
      <tr>
        <th>Task Description</th>
        <th>Responsible Officer</th>
        <th>Deadline</th>
        <th>Priority</th>
      </tr>
    </thead>
    <tbody>
      ${meeting.actionItems
                .map((item) => `
      <tr>
        <td>${item.task}</td>
        <td>${item.responsibleOfficer}</td>
        <td>${item.deadline ? new Date(item.deadline).toLocaleDateString('en-IN') : 'N/A'}</td>
        <td>${item.priority}</td>
      </tr>`)
                .join('')}
      ${meeting.actionItems.length === 0 ? '<tr><td colspan="4">No action items assigned.</td></tr>' : ''}
    </tbody>
  </table>

  <div style="margin-top: 60px; width: 100%; overflow: hidden;">
    <div style="float: left; width: 40%; text-align: center; border-top: 1px solid #333; padding-top: 5px; font-size: 12px; font-weight: bold;">
      Prepared By:<br>
      Shri Rajesh Kumar<br>
      (Panchayat Secretary)
    </div>
    <div style="float: right; width: 40%; text-align: center; border-top: 1px solid #333; padding-top: 5px; font-size: 12px; font-weight: bold;">
      Approved By:<br>
      Smt. Sunita Devi<br>
      (Gram Pradhan)
    </div>
  </div>
</body>
</html>
`;
            if (format === 'word') {
                res.setHeader('Content-Type', 'application/msword');
                res.setHeader('Content-Disposition', `attachment; filename="Meeting_Minutes_${meeting.id}.doc"`);
                return res.send(htmlContent);
            }
            // PDF format: Return the HTML directly so that the browser's PDF engine can print it.
            res.setHeader('Content-Type', 'text/html');
            return res.send(htmlContent + '<script>window.print();</script>');
        }
        res.status(400).json({ message: 'Invalid export format' });
    }
    catch (error) {
        console.error('Error exporting meeting:', error);
        res.status(500).json({ message: 'Error exporting meeting', error: error.message });
    }
};
exports.exportMeeting = exportMeeting;
