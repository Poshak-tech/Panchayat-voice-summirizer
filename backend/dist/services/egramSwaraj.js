"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEGramSwarajMeetings = void 0;
const fetchEGramSwarajMeetings = async (panchayatName, financialYear) => {
    // Mocking eGramSwaraj API response
    // In production, this would make an HTTP request to the eGramSwaraj API gateway
    return [
        {
            id: "EGS-2026-001",
            panchayatName: panchayatName || "Kalyanpur Gram Panchayat",
            villageName: "Kalyanpur East",
            meetingType: "Gram Sabha",
            financialYear: financialYear || "2026-2027",
            date: "2026-06-12T10:30:00Z",
            agenda: "Approval of MGNREGA Annual Action Plan, drinking water pipeline extension under Jal Jeevan Mission, and selection of PM-AWAS Gramin beneficiaries.",
            participants: [
                "Shri Rajesh Kumar (Panchayat Secretary)",
                "Smt. Sunita Devi (Gram Pradhan)",
                "Shri Amit Singh (Block Development Officer)",
                "Shri Vijay Patel (Junior Engineer, Water Dept)",
                "Smt. Meena Bai (Asha Worker)",
                "Shri Ramesh Chand (Citizen Representative)"
            ],
            documents: [
                { name: "MGNREGA_Draft_Plan_2026.pdf", url: "/uploads/docs/mgnrega_draft_2026.pdf" },
                { name: "Jal_Jeevan_Proposal.pdf", url: "/uploads/docs/jal_jeevan_proposal.pdf" }
            ]
        },
        {
            id: "EGS-2026-002",
            panchayatName: panchayatName || "Kalyanpur Gram Panchayat",
            villageName: "Rampur",
            meetingType: "Ward Sabha",
            financialYear: financialYear || "2026-2027",
            date: "2026-06-18T11:00:00Z",
            agenda: "Discussion on village sanitation, road repairs, and installation of solar street lights in Ward No. 4.",
            participants: [
                "Shri Rajesh Kumar (Panchayat Secretary)",
                "Shri Dinesh Prasad (Ward Member)",
                "Smt. Kamla Devi (Citizen Representative)",
                "Shri Suresh Kumar (Citizen Representative)"
            ],
            documents: [
                { name: "Sanitation_Budget_Est.xlsx", url: "/uploads/docs/sanitation_budget.xlsx" }
            ]
        },
        {
            id: "EGS-2026-003",
            panchayatName: panchayatName || "Kalyanpur Gram Panchayat",
            villageName: "Kalyanpur West",
            meetingType: "Special Meeting",
            financialYear: financialYear || "2026-2027",
            date: "2026-06-22T14:00:00Z",
            agenda: "Emergency review of monsoon preparedness, flood channel cleaning, and distribution of subsidized seeds to farmers.",
            participants: [
                "Shri Rajesh Kumar (Panchayat Secretary)",
                "Smt. Sunita Devi (Gram Pradhan)",
                "Shri Anil Kumar (Agricultural Officer)",
                "Shri Vijay Patel (Junior Engineer)",
                "Shri Harish Verma (Local Farmer Leader)"
            ],
            documents: [
                { name: "Monsoon_Action_Plan.pdf", url: "/uploads/docs/monsoon_plan.pdf" }
            ]
        }
    ];
};
exports.fetchEGramSwarajMeetings = fetchEGramSwarajMeetings;
