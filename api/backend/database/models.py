# STL
import datetime

# PDM
from sqlalchemy import JSON, Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

# LOCAL
from api.backend.database.base import Base


class User(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    disabled = Column(Boolean, default=False)

    jobs = relationship("Job", back_populates="user_obj", cascade="all, delete-orphan")
    cron_jobs = relationship(
        "CronJob", back_populates="user_obj", cascade="all, delete-orphan"
    )


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, nullable=False)
    url = Column(String, nullable=False)
    elements = Column(JSON, nullable=False)
    user = Column(String, ForeignKey("users.email"), nullable=True)
    time_created = Column(
        DateTime, default=datetime.datetime.now(datetime.timezone.utc), nullable=False
    )
    result = Column(JSON, nullable=False)
    status = Column(String, nullable=False)
    chat = Column(JSON, nullable=True)
    job_options = Column(JSON, nullable=True)
    agent_mode = Column(Boolean, default=False, nullable=False)
    prompt = Column(String, nullable=True)
    favorite = Column(Boolean, default=False, nullable=False)

    user_obj = relationship("User", back_populates="jobs")
    cron_jobs = relationship(
        "CronJob", back_populates="job_obj", cascade="all, delete-orphan"
    )


class CronJob(Base):
    __tablename__ = "cron_jobs"

    id = Column(String, primary_key=True, nullable=False)
    user_email = Column(String, ForeignKey("users.email"), nullable=False)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    cron_expression = Column(String, nullable=False)
    time_created = Column(
        DateTime, default=datetime.datetime.now(datetime.timezone.utc), nullable=False
    )
    time_updated = Column(
        DateTime, default=datetime.datetime.now(datetime.timezone.utc), nullable=False
    )

    user_obj = relationship("User", back_populates="cron_jobs")
    job_obj = relationship("Job", back_populates="cron_jobs")
