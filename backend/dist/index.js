"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = __importDefault(require("./routes/auth"));
const meeting_1 = __importDefault(require("./routes/meeting"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve uploaded audio files (if any)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/meetings', meeting_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Auto-Seeding function
const autoSeed = async () => {
    try {
        const userCount = await db_1.default.user.count();
        if (userCount > 0) {
            console.log('Database already contains data. Skipping seeding.');
            return;
        }
        console.log('Database is empty. Starting auto-seeding...');
        // 1. Create Default Users
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        const secretary = await db_1.default.user.create({
            data: {
                email: 'secretary@panchayat.gov.in',
                password: hashedPassword,
                name: 'Shri Rajesh Kumar',
                role: 'SECRETARY',
                panchayat: 'Kalyanpur Gram Panchayat',
            },
        });
        const officer = await db_1.default.user.create({
            data: {
                email: 'officer@panchayat.gov.in',
                password: hashedPassword,
                name: 'Shri Amit Singh',
                role: 'OFFICER',
                panchayat: 'Kalyanpur Gram Panchayat',
            },
        });
        const admin = await db_1.default.user.create({
            data: {
                email: 'admin@panchayat.gov.in',
                password: hashedPassword,
                name: 'Administrator',
                role: 'ADMIN',
            },
        });
        console.log('Users seeded successfully.');
        // 2. Create Sample Completed Meeting
        const meetingDate = new Date();
        meetingDate.setDate(meetingDate.getDate() - 5); // 5 days ago
        const participants = [
            'Shri Rajesh Kumar (Panchayat Secretary)',
            'Smt. Sunita Devi (Gram Pradhan)',
            'Shri Amit Singh (Block Development Officer)',
            'Shri Vijay Patel (Junior Engineer, Water Dept)',
            'Smt. Meena Bai (Asha Worker)',
            'Shri Ramesh Chand (Citizen Representative)',
        ];
        const meeting = await db_1.default.meeting.create({
            data: {
                title: 'Jal Jeevan Mission & MGNREGA Planning Meeting',
                description: 'Regular Gram Sabha meeting to plan rural development activities for the financial year.',
                date: meetingDate,
                panchayatName: 'Kalyanpur Gram Panchayat',
                villageName: 'Kalyanpur East',
                meetingType: 'Gram Sabha',
                financialYear: '2026-2027',
                agenda: 'Approval of MGNREGA Annual Action Plan, drinking water pipeline extension under Jal Jeevan Mission, and selection of PM-AWAS Gramin beneficiaries.',
                participants: JSON.stringify(participants),
                status: 'COMPLETED',
                creatorId: secretary.id,
            },
        });
        // 3. Seed Transcript
        const segments = [
            { start: 0, end: 12, speaker: 'Smt. Sunita Devi (Gram Pradhan)', text: 'Namaskar everyone. I welcome you all to today\'s Gram Sabha meeting. Today we are discussing key projects for the financial year 2026-27.' },
            { start: 13, end: 28, speaker: 'Shri Rajesh Kumar (Panchayat Secretary)', text: 'Thank you Pradhan Ji. The agenda has been shared. First, we will review the MGNREGA action plan. We need to approve the repairs for the village main road.' },
            { start: 29, end: 45, speaker: 'Shri Ramesh Chand (Citizen Representative)', text: 'The main road in Kalyanpur East has huge potholes. It is very dangerous for children and senior citizens. We request immediate allocation of funds for its repair.' },
            { start: 46, end: 59, speaker: 'Smt. Sunita Devi (Gram Pradhan)', text: 'Yes, Ramesh Ji. We have noted this. I propose a budget of 5 Lakh Rupees from the Gram Panchayat Development Plan funds for this road repair. Do we all agree?' },
            { start: 60, end: 68, speaker: 'Participants', text: 'Yes, we agree. Approved.' },
            { start: 69, end: 88, speaker: 'Shri Rajesh Kumar (Panchayat Secretary)', text: 'Excellent. Next agenda is the Jal Jeevan Mission. The water pipeline in Ward 3 has been leaking, and the dry zones need pipeline extensions before summer.' },
            { start: 89, end: 108, speaker: 'Shri Vijay Patel (Junior Engineer)', text: 'Pradhan Ji, I have surveyed Ward 3. We need an extension of approximately 450 meters of pipeline. The estimated budget is 2.5 Lakh Rupees. We can execute this under the Jal Jeevan Mission grant.' },
            { start: 109, end: 122, speaker: 'Smt. Sunita Devi (Gram Pradhan)', text: 'Vijay Ji, please draft the technical sanction today. Rajesh Ji, please issue the contract by mid-July so that work can begin immediately.' },
            { start: 123, end: 142, speaker: 'Smt. Meena Bai (Asha Worker)', text: 'I also want to raise a concern. The drainage line near the community hall is choked. With the monsoon approaching, it will overflow and cause health hazards. It needs cleaning.' },
            { start: 143, end: 158, speaker: 'Shri Rajesh Kumar (Panchayat Secretary)', text: 'Meena Ji is correct. I will personally supervise the cleaning. We will hire workers under MGNREGA to clear all drainage channels. This will start by next week and be completed by July 5th.' },
            { start: 159, end: 180, speaker: 'Shri Amit Singh (Block Development Officer)', text: 'Very good. Please also finalize the list of 5 beneficiaries for the PM-AWAS Gramin housing scheme. The eligibility criteria must be strictly followed, and the list should be submitted to my office by the end of this month.' },
            { start: 181, end: 198, speaker: 'Shri Rajesh Kumar (Panchayat Secretary)', text: 'Yes, Amit Ji. The verification is complete. The selected beneficiaries are draft list: Lalit Prasad, Kamala Devi, Suresh Ram, Munni Devi, and Ram Charan. I will submit the files to you.' },
            { start: 199, end: 215, speaker: 'Smt. Sunita Devi (Gram Pradhan)', text: 'Thank you all. With this, we conclude today\'s meeting. I request everyone to ensure timely completion of their assigned tasks. Jai Hind.' }
        ];
        await db_1.default.transcript.create({
            data: {
                meetingId: meeting.id,
                text: segments.map((s) => `${s.speaker}: ${s.text}`).join('\n\n'),
                segments: JSON.stringify(segments),
            },
        });
        // 4. Seed Summary
        const schemesMentioned = [
            { name: 'MGNREGA', context: 'Used for hiring local labor to clean village drainage channels and road repair works.' },
            { name: 'Jal Jeevan Mission', context: 'Funding the 450m drinking water pipeline extension in Ward 3.' },
            { name: 'PM-AWAS Gramin', context: 'Selection and approval of 5 housing beneficiaries for submission to the Block Office.' },
        ];
        const budgetDiscussions = [
            { amount: 500000, purpose: 'Village main road repair in Kalyanpur East', context: 'Approved from the Gram Panchayat Development Plan (GPDP) fund.' },
            { amount: 250000, purpose: '450m water pipeline extension in Ward 3', context: 'Funded under the Jal Jeevan Mission scheme allocation.' },
        ];
        await db_1.default.summary.create({
            data: {
                meetingId: meeting.id,
                executiveSummary: 'The Gram Sabha meeting, chaired by Gram Pradhan Smt. Sunita Devi, successfully finalized major development projects for FY 2026-27. Key decisions centered on road infrastructure, drinking water supply under the Jal Jeevan Mission, monsoon drainage preparedness, and housing under PM-AWAS Gramin. A total budget of Rs. 7.5 Lakhs was allocated across approved projects, and specific action items were assigned to officers with strict deadlines.',
                keyDiscussionPoints: JSON.stringify([
                    'Review of road damage in Kalyanpur East and budget allocation for repair.',
                    'Addressing water scarcity in Ward 3 through pipeline extension planning.',
                    'Monsoon preparedness, specifically clearing choked drainage channels near the community hall.',
                    'Eligibility verification and selection of beneficiaries for the PM-AWAS Gramin housing scheme.'
                ]),
                decisionsTaken: JSON.stringify([
                    'Approved Rs. 5 Lakhs for repairing the Kalyanpur East main road.',
                    'Approved Rs. 2.5 Lakhs for a 450-meter water pipeline extension in Ward 3.',
                    'Approved hiring of local labor under MGNREGA for clearing village drainage channels.',
                    'Finalized the list of 5 beneficiaries for PM-AWAS Gramin.'
                ]),
                schemesMentioned: JSON.stringify(schemesMentioned),
                budgetDiscussions: JSON.stringify(budgetDiscussions),
                problemsRaised: JSON.stringify([
                    'Severe pothole damage on the Kalyanpur East main road, posing risks to commuters.',
                    'Water scarcity and pipeline leaks in Ward 3.',
                    'Choked drainage lines near the community hall raising health and flooding concerns ahead of monsoon.'
                ]),
                citizenRequests: JSON.stringify([
                    'Citizen Ramesh Chand requested immediate road repair in Kalyanpur East.',
                    'Asha Worker Meena Bai requested urgent cleaning of the community hall drainage lines.'
                ]),
            },
        });
        // 5. Seed Action Items
        await db_1.default.actionItem.createMany({
            data: [
                {
                    meetingId: meeting.id,
                    task: 'Draft technical sanction and execute contract for the 450m water pipeline extension in Ward 3.',
                    responsibleOfficer: 'Shri Vijay Patel (Junior Engineer)',
                    deadline: new Date('2026-07-15T23:59:59Z'),
                    priority: 'HIGH',
                    status: 'PENDING',
                },
                {
                    meetingId: meeting.id,
                    task: 'Submit the verified list of 5 PM-AWAS Gramin beneficiaries to the Block Office.',
                    responsibleOfficer: 'Shri Rajesh Kumar (Panchayat Secretary)',
                    deadline: new Date('2026-06-30T23:59:59Z'),
                    priority: 'MEDIUM',
                    status: 'COMPLETED',
                },
                {
                    meetingId: meeting.id,
                    task: 'Supervise the cleaning of choked drainage lines using MGNREGA labor.',
                    responsibleOfficer: 'Shri Rajesh Kumar (Panchayat Secretary)',
                    deadline: new Date('2026-07-05T23:59:59Z'),
                    priority: 'HIGH',
                    status: 'IN_PROGRESS',
                },
            ],
        });
        console.log('Database seeded successfully with sample records!');
    }
    catch (err) {
        console.error('Error seeding database:', err);
    }
};
// Start Server and run auto-seeding
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await autoSeed();
});
