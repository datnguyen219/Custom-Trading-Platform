"""Added BuyLimitOrder and SellLimitOrder, removed Threshold

Revision ID: 3df208c08b8f
Revises: f909d64597fe
Create Date: 2024-08-25 22:01:28.054884

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3df208c08b8f'
down_revision = 'f909d64597fe'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('buy_limit_orders',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('stock_symbol', sa.Integer(), nullable=False),
    sa.Column('buy_threshold', sa.Float(), nullable=False),
    sa.Column('buy_quantity', sa.Float(), nullable=False),
    sa.ForeignKeyConstraint(['stock_symbol'], ['stocks.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sell_limit_orders',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('stock_id', sa.Integer(), nullable=False),
    sa.Column('sell_threshold', sa.Float(), nullable=False),
    sa.Column('sell_quantity', sa.Float(), nullable=False),
    sa.ForeignKeyConstraint(['stock_id'], ['stocks.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('sell_limit_orders')
    op.drop_table('buy_limit_orders')
    # ### end Alembic commands ###
