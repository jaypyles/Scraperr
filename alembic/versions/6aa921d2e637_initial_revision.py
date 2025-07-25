"""initial revision

Revision ID: 6aa921d2e637
Revises: 
Create Date: 2025-07-12 20:17:44.448034

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6aa921d2e637'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('hashed_password', sa.String(length=255), nullable=False),
    sa.Column('full_name', sa.String(length=255), nullable=True),
    sa.Column('disabled', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('email')
    )
    op.create_table('jobs',
    sa.Column('id', sa.String(length=64), nullable=False),
    sa.Column('url', sa.String(length=2048), nullable=False),
    sa.Column('elements', sa.JSON(), nullable=False),
    sa.Column('user', sa.String(length=255), nullable=True),
    sa.Column('time_created', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('result', sa.JSON(), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.Column('chat', sa.JSON(), nullable=True),
    sa.Column('job_options', sa.JSON(), nullable=True),
    sa.Column('agent_mode', sa.Boolean(), nullable=False),
    sa.Column('prompt', sa.String(length=1024), nullable=True),
    sa.Column('favorite', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['user'], ['users.email'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('cron_jobs',
    sa.Column('id', sa.String(length=64), nullable=False),
    sa.Column('user_email', sa.String(length=255), nullable=False),
    sa.Column('job_id', sa.String(length=64), nullable=False),
    sa.Column('cron_expression', sa.String(length=255), nullable=False),
    sa.Column('time_created', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('time_updated', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ),
    sa.ForeignKeyConstraint(['user_email'], ['users.email'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('cron_jobs')
    op.drop_table('jobs')
    op.drop_table('users')
    # ### end Alembic commands ###
