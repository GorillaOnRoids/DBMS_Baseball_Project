[DBMS_outline.pdf](https://github.com/user-attachments/files/23484317/DBMS_outline.pdf)
# Project Overview

Define the scope and objectives of the database project, including the problem it aims to solve and the target users.

Create a website/database for the baseball staff/pitchers to use that will provide all of their collected data in a organized fashion.

# Requirements Gathering

- Identify stakeholders and end users
    - Baseball team staff/players
- Collect functional requirements (what the database should do)
    - MySQL will hold all of the data from the csv files
    - Website will allow staff to upload csv data files into the database
    - Website will have 6 pages:
        - reports
            - select player name
            - show dates of data to be viewed
            - display all stats in a readable fashion
            - display graphs that give a visual of where the pitches are landing in the zone
                - have a legend of colors that show which pitch was a fastball, change up, splitter, etc.
            - option to download the report
                - maybe as a excel file or pdf?
        - leaderboards
            - select pitch type
            - select the metric to measured for leaderboard
                - max velo, height, spin, count, extension, etc.
            - a date range selector
            - descending or ascending toggle
            - should show rank, player name, and the value of the metric that was measured
        - in-zone % leaderboard
            - select sort order
            - select amount of players to be viewed
            - select date range
            - should show rank, player name, strike %
        - progression
            - select player
            - show graphs of velocity progression of various pitches
                - x-axis: dates of data recorded
                - y-axis velo in mph
            - show graph of strike percentage progression
                - x-axis: dates of data recorded
                - y-axis: in zone%
        - stuff+leaderboard
            - select pitch type
            - select date range
            - show rank, pitcher, stuff+ number, avg velo, IVB number, HB number, spin, extension, rel side, and rel height
            - to be on leaderboard pitcher must throw a fastball harder than 92 mph and have throw 1 style of pitch more than 20 times
        - data refresh (only available to staff with premissions)
            - upload new csv files
- Collect non-functional requirements (performance, security, scalability)
- Document data sources and types of information to be stored

# Database Design

## Conceptual Design

- Create Entity-Relationship (ER) diagrams
- Identify entities, attributes, and relationships
- Define cardinality and constraints

## Logical Design

- Convert ER diagram to relational schema
- Normalize tables (1NF, 2NF, 3NF, BCNF)
- Define primary keys, foreign keys, and indexes

## Physical Design

- Choose DBMS platform (MySQL, PostgreSQL, Oracle, etc.)
- Optimize storage and performance considerations
- Define data types and constraints

# Implementation

- Create database schema using SQL DDL statements
- Implement tables, views, stored procedures, and triggers
- Set up user roles and permissions
- Populate database with initial/test data

# Application Development

- Develop frontend interface (if applicable)
- Create backend API for database interactions
- Implement CRUD operations (Create, Read, Update, Delete)
- Integrate with existing systems if needed

# Testing

- Unit testing of database functions and procedures
- Integration testing with application components
- Performance testing (query optimization, load testing)
- Security testing (SQL injection, access control)
- User acceptance testing (UAT)

# Documentation

- Database schema documentation
- Data dictionary (tables, columns, data types, relationships)
- User manual and administrator guide
- API documentation (if applicable)

# Deployment

- Set up production environment
- Migrate data from development to production
- Configure backup and recovery procedures
- Monitor database performance

# Maintenance & Support

- Regular database backups
- Performance monitoring and optimization
- Bug fixes and updates
- User support and training

# Project Timeline

Create a Gantt chart or timeline with milestones for each phase of the project.

# Resources & Team

- Database Administrator (DBA)
- Backend Developers
- Frontend Developers (if applicable)
- QA/Testing team
- Project Manager

# Risk Management

- Identify potential risks (data loss, security breaches, performance issues)
- Develop mitigation strategies
- Create contingency plans
