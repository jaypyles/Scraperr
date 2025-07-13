# PDM
from sqlalchemy import JSON, Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

# LOCAL
from api.backend.database.base import Base


class User(Base):
    __tablename__ = "users"

    email = Column(String(255), primary_key=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    disabled = Column(Boolean, default=False)

    jobs = relationship("Job", back_populates="user_obj", cascade="all, delete-orphan")
    cron_jobs = relationship(
        "CronJob", back_populates="user_obj", cascade="all, delete-orphan"
    )


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(64), primary_key=True, nullable=False)
    url = Column(String(2048), nullable=False)
    elements = Column(JSON, nullable=False)
    user = Column(String(255), ForeignKey("users.email"), nullable=True)
    time_created = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    result = Column(JSON, nullable=False)
    status = Column(String(50), nullable=False)
    chat = Column(JSON, nullable=True)
    job_options = Column(JSON, nullable=True)
    agent_mode = Column(Boolean, default=False, nullable=False)
    prompt = Column(String(1024), nullable=True)
    favorite = Column(Boolean, default=False, nullable=False)

    user_obj = relationship("User", back_populates="jobs")
    cron_jobs = relationship(
        "CronJob", back_populates="job_obj", cascade="all, delete-orphan"
    )


class CronJob(Base):
    __tablename__ = "cron_jobs"

    id = Column(String(64), primary_key=True, nullable=False)
    user_email = Column(String(255), ForeignKey("users.email"), nullable=False)
    job_id = Column(String(64), ForeignKey("jobs.id"), nullable=False)
    cron_expression = Column(String(255), nullable=False)
    time_created = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    time_updated = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user_obj = relationship("User", back_populates="cron_jobs")
    job_obj = relationship("Job", back_populates="cron_jobs")
