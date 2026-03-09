CREATE DATABASE IF NOT EXISTS saas_billing;
USE saas_billing;

-- The Flask application via SQLAlchemy / Flask-Migrate will take care of creating the tables.
-- This file exists purely to ensure the database container provisions the initial database schema correctly on startup.
