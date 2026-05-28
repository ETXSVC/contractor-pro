from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    companyName: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    tenantId: str

class AuthResponse(BaseModel):
    token: str
    user: UserOut


# ── Projects ─────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    category: str = "In Progress"
    status: str
    progress: int = 0
    duration: str
    description: str
    image: str
    clientName: str
    budget: float
    spent: float = 0
    unreadMessages: int = 0
    tasksCount: int = 0
    lastViewedDate: Optional[str] = None
    alert: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    clientName: Optional[str] = None
    budget: Optional[float] = None
    spent: Optional[float] = None
    unreadMessages: Optional[int] = None
    tasksCount: Optional[int] = None
    lastViewedDate: Optional[str] = None
    alert: Optional[str] = None

class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: str
    status: str
    progress: int
    duration: str
    description: str
    image: str
    clientName: str = ""
    budget: float
    spent: float
    unreadMessages: int
    tasksCount: int
    lastViewedDate: Optional[str] = None
    alert: Optional[str] = None
    tenantId: str = ""
    createdAt: Optional[datetime] = None

    @classmethod
    def from_orm_row(cls, row):
        return cls(
            id=row.id,
            name=row.name,
            category=row.category,
            status=row.status,
            progress=row.progress,
            duration=row.duration,
            description=row.description,
            image=row.image,
            clientName=row.client_name,
            budget=row.budget,
            spent=row.spent,
            unreadMessages=row.unread_messages,
            tasksCount=row.tasks_count,
            lastViewedDate=row.last_viewed_date,
            alert=row.alert,
            tenantId=row.tenant_id,
            createdAt=row.created_at,
        )


# ── Tasks ─────────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    assigneeId: str
    dueDate: str
    priority: str = "Medium"
    status: str = "To Do"
    projectId: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    assigneeId: Optional[str] = None
    dueDate: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    projectId: Optional[str] = None

class TaskOut(BaseModel):
    id: str
    title: str
    assigneeId: str
    dueDate: str
    priority: str
    status: str
    projectId: str
    tenantId: str = ""

    @classmethod
    def from_orm_row(cls, row):
        return cls(
            id=row.id,
            title=row.title,
            assigneeId=row.assignee_id,
            dueDate=row.due_date,
            priority=row.priority,
            status=row.status,
            projectId=row.project_id,
            tenantId=row.tenant_id,
        )


# ── Documents ─────────────────────────────────────────────────────────────────

class DocumentCreate(BaseModel):
    name: str
    category: str = "Blueprints"
    uploadedBy: str = "Team Member"
    uploadedAt: str = "Today"
    size: str = "0 MB"
    fileType: str = ""
    fileUrl: Optional[str] = None

class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    uploadedBy: Optional[str] = None
    uploadedAt: Optional[str] = None
    fileType: Optional[str] = None

class DocumentOut(BaseModel):
    id: str
    name: str
    category: str
    uploadedBy: str
    uploadedAt: str
    size: str
    fileType: str
    fileUrl: Optional[str] = None
    tenantId: str = ""

    @classmethod
    def from_orm_row(cls, row):
        return cls(
            id=row.id,
            name=row.name,
            category=row.category,
            uploadedBy=row.uploaded_by,
            uploadedAt=row.uploaded_at,
            size=row.size,
            fileType=row.file_type,
            fileUrl=row.file_url,
            tenantId=row.tenant_id,
        )


# ── Team ─────────────────────────────────────────────────────────────────────

class TeamMemberCreate(BaseModel):
    name: str
    role: str
    avatar: str
    activeProjects: list[str] = []
    status: str = "Online"
    department: str
    phone: str
    email: str

class TeamMemberOut(BaseModel):
    id: str
    name: str
    role: str
    avatar: str
    activeProjects: list[str]
    status: str
    department: str
    phone: str
    email: str
    tenantId: str = ""

    @classmethod
    def from_orm_row(cls, row):
        return cls(
            id=row.id,
            name=row.name,
            role=row.role,
            avatar=row.avatar,
            activeProjects=row.active_projects or [],
            status=row.status,
            department=row.department,
            phone=row.phone,
            email=row.email,
            tenantId=row.tenant_id,
        )


# ── Proposals ────────────────────────────────────────────────────────────────

class ProposalCreate(BaseModel):
    projectName: str
    clientName: str
    value: float
    status: str = "Drafting"
    dateSent: str
    notes: str

class ProposalOut(BaseModel):
    id: str
    projectName: str
    clientName: str
    value: float
    status: str
    dateSent: str
    notes: str
    tenantId: str = ""

    @classmethod
    def from_orm_row(cls, row):
        return cls(
            id=row.id,
            projectName=row.project_name,
            clientName=row.client_name,
            value=row.value,
            status=row.status,
            dateSent=row.date_sent,
            notes=row.notes,
            tenantId=row.tenant_id,
        )


# ── Invoices ─────────────────────────────────────────────────────────────────

class InvoiceCreate(BaseModel):
    projectName: str
    amount: float
    dueDate: str
    status: str = "Pending"

class InvoiceUpdate(BaseModel):
    projectName: Optional[str] = None
    amount: Optional[float] = None
    dueDate: Optional[str] = None
    status: Optional[str] = None

class InvoiceOut(BaseModel):
    id: str
    projectName: str
    amount: float
    dueDate: str
    status: str
    tenantId: str = ""

    @classmethod
    def from_orm_row(cls, row):
        return cls(
            id=row.id,
            projectName=row.project_name,
            amount=row.amount,
            dueDate=row.due_date,
            status=row.status,
            tenantId=row.tenant_id,
        )


# ── Change Orders ─────────────────────────────────────────────────────────────

class ChangeOrderCreate(BaseModel):
    title: str
    projectId: str
    projectName: str
    amount: float
    status: str = "Pending"
    dateRequested: str

class ChangeOrderUpdate(BaseModel):
    title: Optional[str] = None
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    dateRequested: Optional[str] = None

class ChangeOrderOut(BaseModel):
    id: str
    title: str
    projectId: str
    projectName: str
    amount: float
    status: str
    dateRequested: str
    tenantId: str = ""

    @classmethod
    def from_orm_row(cls, row):
        return cls(
            id=row.id,
            title=row.title,
            projectId=row.project_id,
            projectName=row.project_name,
            amount=row.amount,
            status=row.status,
            dateRequested=row.date_requested,
            tenantId=row.tenant_id,
        )


# ── Budgets ───────────────────────────────────────────────────────────────────

class BudgetCreate(BaseModel):
    code: str
    description: str
    category: str
    budgeted: float
    actual: float = 0
    committed: float = 0

class BudgetUpdate(BaseModel):
    code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    budgeted: Optional[float] = None
    actual: Optional[float] = None
    committed: Optional[float] = None

class BudgetOut(BaseModel):
    id: str
    code: str
    description: str
    category: str
    budgeted: float
    actual: float
    committed: float
    tenantId: str = ""

    @classmethod
    def from_orm_row(cls, row):
        return cls(
            id=row.id,
            code=row.code,
            description=row.description,
            category=row.category,
            budgeted=row.budgeted,
            actual=row.actual,
            committed=row.committed,
            tenantId=row.tenant_id,
        )


# ── Time Records ──────────────────────────────────────────────────────────────

class TimeRecordCreate(BaseModel):
    projectId: str
    projectName: str
    employeeId: str
    employeeName: str
    date: str
    hours: float
    billable: bool = True
    description: str

class TimeRecordOut(BaseModel):
    id: str
    projectId: str
    projectName: str
    employeeId: str
    employeeName: str
    date: str
    hours: float
    billable: bool
    description: str
    tenantId: str = ""

    @classmethod
    def from_orm_row(cls, row):
        return cls(
            id=row.id,
            projectId=row.project_id,
            projectName=row.project_name,
            employeeId=row.employee_id,
            employeeName=row.employee_name,
            date=row.date,
            hours=row.hours,
            billable=row.billable,
            description=row.description,
            tenantId=row.tenant_id,
        )
