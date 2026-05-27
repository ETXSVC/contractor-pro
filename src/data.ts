import { Project, Task, Document, TeamMember, Proposal, Invoice, TimeRecord, BudgetCostCode, ChangeOrder } from "./types";

// Start datasets representing exactly the mockups
export const initialProjects: Project[] = [
  {
    id: "proj_1",
    name: "Davis Bathroom Renovation",
    category: "In Progress",
    status: "Pending Inspection",
    progress: 72,
    duration: "May 10 - Jun 15",
    description: "High-end luxury master bathroom renovation including bespoke double vanity, marble custom steam shower, smart floor heating, and freestanding tub.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400",
    clientName: "Marcus Davis",
    budget: 45000,
    spent: 32400,
    unreadMessages: 2,
    tasksCount: 6
  },
  {
    id: "proj_2",
    name: "Chen Deck Construction",
    category: "In Progress",
    status: "Completed",
    progress: 100,
    duration: "Apr 02 - May 20",
    description: "Multi-level cedar deck with custom pergolas, automated step lights, and structural reinforcement for a future hot tub installation.",
    image: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=400",
    clientName: "Sonia Chen",
    budget: 18500,
    spent: 17900,
    unreadMessages: 0,
    tasksCount: 6
  },
  {
    id: "proj_3",
    name: "Miller Kitchen Remodeling",
    category: "Bidding",
    status: "Proposal Sent",
    progress: 0,
    duration: "Jun 20 - Aug 05",
    description: "Full gut kitchen renovation with custom shaker cabinetry, Viking professional range, custom waterfall quartz island, and tile backsplash.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
    clientName: "Robert Miller",
    budget: 85000,
    spent: 0,
    unreadMessages: 1,
    tasksCount: 0,
    lastViewedDate: "Yesterday"
  },
  {
    id: "proj_4",
    name: "Riverside Office Plaza",
    category: "In Progress",
    status: "Active",
    progress: 35,
    duration: "Mar 01 - Nov 30",
    description: "Commercial multi-tenant retail interior buildout. Electrical panel upgrades, heavy metal stud framing, fire dampening acoustic drywall, and sprinkler grid.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
    clientName: "Riverside Holdings",
    budget: 1200000,
    spent: 850000,
    unreadMessages: 0,
    tasksCount: 15,
    alert: "Material Delay"
  },
  {
    id: "proj_5",
    name: "Oakwood Heights Residence",
    category: "Bidding",
    status: "Drafting",
    progress: 0,
    duration: "Jul 15 - Dec 10",
    description: "Architectural custom framing of luxury smart home from the foundation up. Advanced truss network, solar panel array preparation, and composite cladding.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400",
    clientName: "Dr. Evans",
    budget: 320000,
    spent: 0,
    unreadMessages: 0,
    tasksCount: 0
  }
];

export const initialTasks: Task[] = [
  {
    id: "task_1",
    projectId: "proj_1",
    title: "Schedule Master Electrical Inspection",
    assigneeId: "team_2",
    dueDate: "2026-05-28",
    priority: "High",
    status: "In Progress"
  },
  {
    id: "task_2",
    projectId: "proj_1",
    title: "Tape, mud & sand drywall partitions",
    assigneeId: "team_3",
    dueDate: "2026-05-30",
    priority: "Medium",
    status: "To Do"
  },
  {
    id: "task_3",
    projectId: "proj_1",
    title: "Waterproofing barrier flood test safety sign-off",
    assigneeId: "team_1",
    dueDate: "2026-05-27",
    priority: "High",
    status: "Done"
  },
  {
    id: "task_4",
    projectId: "proj_2",
    title: "Install deck post automated ambient LED layout",
    assigneeId: "team_2",
    dueDate: "2026-05-25",
    priority: "Low",
    status: "Done"
  },
  {
    id: "task_5",
    projectId: "proj_4",
    title: "Coordinate fire damper permit approval",
    assigneeId: "team_1",
    dueDate: "2026-05-29",
    priority: "High",
    status: "Review"
  },
  {
    id: "task_6",
    projectId: "proj_4",
    title: "Install metal studs partition - Segment B",
    assigneeId: "team_3",
    dueDate: "2026-06-02",
    priority: "Medium",
    status: "In Progress"
  },
  {
    id: "task_7",
    projectId: "proj_1",
    title: "Grouting custom grey marble floor tiles",
    assigneeId: "team_3",
    dueDate: "2026-06-03",
    priority: "Medium",
    status: "To Do"
  },
  {
    id: "task_8",
    projectId: "proj_4",
    title: "Rough in plumbing supply copper pipe mains",
    assigneeId: "team_4",
    dueDate: "2026-05-28",
    priority: "High",
    status: "In Progress"
  }
];

export const initialDocuments: Document[] = [
  {
    id: "doc_1",
    name: "Miller Kitchen Blueprints - Draft C.pdf",
    category: "Blueprints",
    uploadedBy: "Jane Doe (PM)",
    uploadedAt: "May 25, 2026",
    size: "14.2 MB",
    fileType: "PDF Document"
  },
  {
    id: "doc_2",
    name: "Davis Electrical Structural Permit.xml",
    category: "Permits",
    uploadedBy: "John Smith",
    uploadedAt: "May 22, 2026",
    size: "420 KB",
    fileType: "Regulatory XML"
  },
  {
    id: "doc_3",
    name: "Daily Field Logs & Inspection Prep Report.pdf",
    category: "Field Reports",
    uploadedBy: "Jane Doe (PM)",
    uploadedAt: "May 24, 2026",
    size: "1.8 MB",
    fileType: "Field Report"
  },
  {
    id: "doc_4",
    name: "Oakwood Heights Subcontractor Agreement.pdf",
    category: "Contracts",
    uploadedBy: "Finance Dept",
    uploadedAt: "May 19, 2026",
    size: "4.5 MB",
    fileType: "Contract Signed PDF"
  }
];

export const initialTeamMembers: TeamMember[] = [
  {
    id: "team_1",
    name: "Jane Doe",
    role: "Project Manager",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    activeProjects: ["Davis Bathroom", "Riverside Office"],
    status: "Online",
    department: "Management",
    email: "jane.doe@contractorpro.co",
    phone: "555-0192"
  },
  {
    id: "team_2",
    name: "John Smith",
    role: "Master Electrician",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    activeProjects: ["Davis Bathroom"],
    status: "In Meeting",
    department: "Electricians",
    email: "john.smith@contractorpro.co",
    phone: "555-0210"
  },
  {
    id: "team_3",
    name: "Emily White",
    role: "Finish Carpenter & Designer",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    activeProjects: ["Chen Deck", "Miller Kitchen"],
    status: "Away",
    department: "Carpentry",
    email: "emily.white@contractorpro.co",
    phone: "555-0315"
  },
  {
    id: "team_4",
    name: "Michael Green",
    role: "Lead MEP Specialist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    activeProjects: ["Riverside Office"],
    status: "Online",
    department: "Plumbing",
    email: "m.green@contractorpro.co",
    phone: "555-0450"
  }
];

export const initialProposals: Proposal[] = [
  {
    id: "prop_1",
    projectName: "Downtown Bridge Restoration",
    clientName: "State Dept of Transit",
    value: 852000,
    status: "Sent",
    dateSent: "May 20, 2026",
    notes: "Awaiting public bid opening. Includes structural metal bracing and anti-corrosive treatments."
  },
  {
    id: "prop_2",
    projectName: "Oakwood Heights Residential Frame",
    clientName: "Dr. Amanda Evans",
    value: 320000,
    status: "Approved",
    dateSent: "May 15, 2026",
    notes: "Contract signed. Foundation excavation scheduled to begin July 15."
  },
  {
    id: "prop_3",
    projectName: "Riviera Estate Pool Decking",
    clientName: "Zack Gold",
    value: 45000,
    status: "Drafting",
    dateSent: "N/A",
    notes: "Designing a luxurious negative edge pool wrap utilizing engineered Ipe joists."
  },
  {
    id: "prop_4",
    projectName: "Urban Loft Interior Partitioning",
    clientName: "Metropolitan Lofts LLC",
    value: 120000,
    status: "Declined",
    dateSent: "May 08, 2026",
    notes: "Disagreed on mechanical timelines. Project bid went to a larger, national firm."
  }
];

export const initialInvoices: Invoice[] = [
  {
    projectName: "Riverside Office Plaza",
    amount: 12420,
    dueDate: "2026-05-20",
    status: "Overdue"
  },
  {
    projectName: "Davis Bathroom Renovation",
    amount: 15000,
    dueDate: "2026-06-12",
    status: "Paid"
  },
  {
    projectName: "Chen Deck Construction",
    amount: 8500,
    dueDate: "2026-06-05",
    status: "Pending"
  },
  {
    projectName: "Miller Kitchen Remodeling",
    amount: 12000,
    dueDate: "2026-06-01",
    status: "Sent"
  }
];

export const initialTimeRecords: TimeRecord[] = [
  {
    id: "time_1",
    projectId: "proj_4",
    projectName: "Riverside Office Plaza",
    employeeId: "team_1",
    employeeName: "Jane Doe",
    date: "2026-05-25",
    hours: 8,
    billable: true,
    description: "Coordinate mechanical, electrical, and plumbing logistics on site."
  },
  {
    id: "time_2",
    projectId: "proj_4",
    projectName: "Riverside Office Plaza",
    employeeId: "team_4",
    employeeName: "Michael Green",
    date: "2026-05-25",
    hours: 10,
    billable: true,
    description: "Mains assembly and welding support sleeves."
  },
  {
    id: "time_3",
    projectId: "proj_1",
    projectName: "Davis Bathroom Renovation",
    employeeId: "team_2",
    employeeName: "John Smith",
    date: "2026-05-25",
    hours: 7.5,
    billable: true,
    description: "Sub-panel routing and smart flooring wiring connection."
  },
  {
    id: "time_4",
    projectId: "proj_1",
    projectName: "Davis Bathroom Renovation",
    employeeId: "team_3",
    employeeName: "Emily White",
    date: "2026-05-25",
    hours: 5,
    billable: true,
    description: "Framing review and custom cabinet measurement checks."
  },
  {
    id: "time_5",
    projectId: "proj_4",
    projectName: "Riverside Office Plaza",
    employeeId: "team_4",
    employeeName: "Michael Green",
    date: "2026-05-24",
    hours: 8,
    billable: true,
    description: "Dry run pressure test on central drains."
  }
];

export const initialBudgetCostCodes: BudgetCostCode[] = [
  { code: "02-100", description: "Demolition & Hauling", category: "Site Work", budgeted: 18000, actual: 16500, committed: 0 },
  { code: "03-200", description: "Concrete Foundation Foundations", category: "Foundation", budgeted: 155000, actual: 162000, committed: 5000 },
  { code: "05-100", description: "Heavy Structural Steel Framing", category: "Steel", budgeted: 450000, actual: 442000, committed: 12000 },
  { code: "06-200", description: "Finish Carpentry & Millwork", category: "Carpentry", budgeted: 124000, actual: 128000, committed: 3500 },
  { code: "09-300", description: "Premium Custom Tiling and Stone", category: "Finishes", budgeted: 85000, actual: 72000, committed: 8000 },
  { code: "21-000", description: "HVAC System Mechanical Units", category: "MEP", budgeted: 180000, actual: 194000, committed: 15000 },
  { code: "26-000", description: "Heavy Electrical Wiring Panels", category: "MEP", budgeted: 220000, actual: 198000, committed: 4500 }
];

export const initialChangeOrders: ChangeOrder[] = [
  {
    id: "co_1",
    title: "Foundation Reinforcement Addendum",
    projectId: "proj_4",
    projectName: "Riverside Office Plaza",
    amount: 24500,
    status: "Approved",
    dateRequested: "May 20, 2026"
  },
  {
    id: "co_2",
    title: "Premium Quartz Backsplash Upgrade",
    projectId: "proj_3",
    projectName: "Miller Kitchen Remodeling",
    amount: 8200,
    status: "Approved",
    dateRequested: "May 22, 2026"
  },
  {
    id: "co_3",
    title: "Additional Electrical Sockets Layout",
    projectId: "proj_1",
    projectName: "Davis Bathroom Renovation",
    amount: 1800,
    status: "Pending",
    dateRequested: "May 25, 2026"
  },
  {
    id: "co_4",
    title: "Change Deck Siding to Composite boards",
    projectId: "proj_2",
    projectName: "Chen Deck Construction",
    amount: 4500,
    status: "Declined",
    dateRequested: "May 18, 2026"
  }
];

export const initialWritings = [
  { id: "news_1", date: "Today", title: "New Handrail Installation safety rules out", category: "Safety", content: "All elevated scaffold assemblies now require continuous dual-connector safety tie-offs starting June 1." },
  { id: "news_2", date: "May 24", title: "Company picnic scheduled for next Friday", category: "General", content: "Join the entire building crew at Golden Gate park for food, beverages, and our yearly awards ceremony." }
];
