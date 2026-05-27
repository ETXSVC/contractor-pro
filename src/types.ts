export interface Project {
  id: string;
  name: string;
  category: "In Progress" | "Bidding" | "Completed";
  status: string;
  progress: number;
  duration: string;
  description: string;
  image: string;
  clientName: string;
  budget: number;
  spent: number;
  unreadMessages: number;
  tasksCount: number;
  lastViewedDate?: string;
  alert?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assigneeId: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "To Do" | "In Progress" | "Review" | "Done";
}

export interface Document {
  id: string;
  name: string;
  category: "Blueprints" | "Permits" | "Field Reports" | "Contracts";
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  fileType: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activeProjects: string[];
  status: "Online" | "Away" | "In Meeting";
  department: "Management" | "Electricians" | "Plumbing" | "Carpentry";
  phone: string;
  email: string;
}

export interface Proposal {
  id: string;
  projectName: string;
  clientName: string;
  value: number;
  status: "Approved" | "Sent" | "Drafting" | "Declined";
  dateSent: string;
  notes: string;
}

export interface Invoice {
  id?: string;
  projectName: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Sent" | "Overdue";
}

export interface TimeRecord {
  id: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hours: number;
  billable: boolean;
  description: string;
}

export interface BudgetCostCode {
  code: string;
  description: string;
  category: string;
  budgeted: number;
  actual: number;
  committed: number;
}

export interface ChangeOrder {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  amount: number;
  status: "Approved" | "Pending" | "Declined";
  dateRequested: string;
}
