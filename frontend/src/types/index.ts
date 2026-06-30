export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'SECRETARY' | 'OFFICER';
  panchayat?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  panchayatName: string;
  villageName: string;
  meetingType: string;
  financialYear: string;
  agenda: string;
  participants: string[];
  audioPath?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  creator?: User;
  transcript?: Transcript;
  summary?: Summary;
  actionItems?: ActionItem[];
}

export interface Transcript {
  id: string;
  meetingId: string;
  text: string;
  segments: TranscriptSegment[];
}

export interface TranscriptSegment {
  start: number;
  end: number;
  speaker: string;
  text: string;
}

export interface Summary {
  id: string;
  meetingId: string;
  executiveSummary: string;
  keyDiscussionPoints: string[];
  decisionsTaken: string[];
  schemesMentioned: SchemeMention[];
  budgetDiscussions: BudgetDiscussion[];
  problemsRaised: string[];
  citizenRequests: string[];
}

export interface SchemeMention {
  name: string;
  context: string;
}

export interface BudgetDiscussion {
  amount: number;
  purpose: string;
  context: string;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  task: string;
  responsibleOfficer: string;
  deadline?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalMeetings: number;
  totalActionItems: number;
  completedTasks: number;
  pendingTasks: number;
  schemeFrequency: { name: string; count: number }[];
  monthlyMeetings: { month: string; count: number }[];
}
