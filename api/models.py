from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from api.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String)
    password: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default="admin")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"))


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String, default="In Progress")
    status: Mapped[str] = mapped_column(String)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    duration: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    image: Mapped[str] = mapped_column(String)
    client_name: Mapped[str] = mapped_column(String, name="clientName")
    budget: Mapped[float] = mapped_column(Float)
    spent: Mapped[float] = mapped_column(Float, default=0)
    unread_messages: Mapped[int] = mapped_column(Integer, default=0, name="unreadMessages")
    tasks_count: Mapped[int] = mapped_column(Integer, default=0, name="tasksCount")
    last_viewed_date: Mapped[str | None] = mapped_column(String, nullable=True, name="lastViewedDate")
    alert: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), name="tenantId")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    assignee_id: Mapped[str] = mapped_column(String, name="assigneeId")
    due_date: Mapped[str] = mapped_column(String, name="dueDate")
    priority: Mapped[str] = mapped_column(String, default="Medium")
    status: Mapped[str] = mapped_column(String, default="To Do")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    project_id: Mapped[str] = mapped_column(String, ForeignKey("projects.id", ondelete="CASCADE"), name="projectId")
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), name="tenantId")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String)
    uploaded_by: Mapped[str] = mapped_column(String, name="uploadedBy")
    uploaded_at: Mapped[str] = mapped_column(String, name="uploadedAt")
    size: Mapped[str] = mapped_column(String)
    file_type: Mapped[str] = mapped_column(String, name="fileType")
    file_url: Mapped[str | None] = mapped_column(String, nullable=True, name="fileUrl")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), name="tenantId")


class TeamMember(Base):
    __tablename__ = "team_members"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String)
    avatar: Mapped[str] = mapped_column(String)
    active_projects: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, name="activeProjects")
    status: Mapped[str] = mapped_column(String, default="Online")
    department: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), name="tenantId")


class Proposal(Base):
    __tablename__ = "proposals"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_name: Mapped[str] = mapped_column(String, name="projectName")
    client_name: Mapped[str] = mapped_column(String, name="clientName")
    value: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String, default="Drafting")
    date_sent: Mapped[str] = mapped_column(String, name="dateSent")
    notes: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), name="tenantId")


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    project_name: Mapped[str] = mapped_column(String, name="projectName")
    amount: Mapped[float] = mapped_column(Float)
    due_date: Mapped[str] = mapped_column(String, name="dueDate")
    status: Mapped[str] = mapped_column(String, default="Pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), name="tenantId")


class TimeRecord(Base):
    __tablename__ = "time_records"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    employee_id: Mapped[str] = mapped_column(String, name="employeeId")
    employee_name: Mapped[str] = mapped_column(String, name="employeeName")
    date: Mapped[str] = mapped_column(String)
    hours: Mapped[float] = mapped_column(Float)
    billable: Mapped[bool] = mapped_column(Boolean, default=True)
    description: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    project_id: Mapped[str] = mapped_column(String, ForeignKey("projects.id", ondelete="CASCADE"), name="projectId")
    project_name: Mapped[str] = mapped_column(String, name="projectName")
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), name="tenantId")


class BudgetCostCode(Base):
    __tablename__ = "budget_cost_codes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String)
    budgeted: Mapped[float] = mapped_column(Float)
    actual: Mapped[float] = mapped_column(Float, default=0)
    committed: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), name="tenantId")


class ChangeOrder(Base):
    __tablename__ = "change_orders"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    project_id: Mapped[str] = mapped_column(String, name="projectId")
    project_name: Mapped[str] = mapped_column(String, name="projectName")
    amount: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String, default="Pending")
    date_requested: Mapped[str] = mapped_column(String, name="dateRequested")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id", ondelete="CASCADE"), name="tenantId")
