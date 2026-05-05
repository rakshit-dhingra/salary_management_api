# 🏗️ System Design — Incubyte Salary Management Tool

This document explains the design decisions, trade-offs, and evolution strategy for building a scalable salary management system for organisations with up to 10,000 employees.

---

## 🎯 Problem Framing

**User Persona:** HR Manager  

The system must:
- Manage employee data (CRUD)
- Provide salary insights for decision-making
- Remain fast and responsive with 10,000+ records

---

## 🧠 Core Design Principles

1. **Database-first thinking**
   - Push computation to the database instead of application layer

2. **Simplicity over premature optimization**
   - Avoid unnecessary complexity (no microservices, no caching initially)

3. **Scalability via evolution, not over-engineering**
   - Design system to scale incrementally

4. **Deterministic and testable system**
   - Predictable seed data and reproducible results

---

## 🏗️ High-Level Architecture
  React (Frontend)
    ↓
  Rails API (Controllers)
    ↓
  PostgreSQL (Data + Analytics)

### Responsibilities

| Layer | Responsibility |
|------|----------------|
| React | UI rendering, state management, user interaction |
| Rails API | Request handling, validation, orchestration |
| PostgreSQL | Data storage + analytics computation |

---

## 📦 Data Model

### Employee

Key fields:

- `first_name`, `last_name`
- `email` (unique)
- `job_title`
- `department`
- `country`
- `salary`
- `employment_type`
- `hire_date`
- `is_active` (soft delete)

### Key Decisions

#### 1. Soft Delete (`is_active`)
- Avoids data loss
- Preserves historical analytics
- Simplifies auditability

---

## 🔍 Query Design (Critical Area)

### Why SQL over Ruby?

Salary insights (min, max, avg, percentiles) are computed using SQL:

- `MIN`, `MAX`, `AVG`
- `PERCENTILE_CONT`
- `WIDTH_BUCKET`

**Reasoning:**
- Avoid loading large datasets into memory
- Leverage database optimizations
- Single query execution vs iterative processing

---

## 📊 Insights Strategy

All insights are computed via **single optimized SQL queries**.

Example:

- Salary percentiles per country
- Salary distribution histogram
- Average salary per job title

**Trade-off:**
- Slightly complex SQL
- But significantly better performance

---

## ⚡ Performance Design

### 1. Seeding Strategy

- 10,000 records generated in memory
- Inserted using `insert_all` in batches of 1000
- Deterministic random seed (`Random.new(42)`)

**Result:**
- ~0.6 seconds total seed time

---

### 2. Indexing Strategy

Indexes added based on query patterns:

- `(country, is_active)`
- `(country, job_title)`
- `email` (unique)
- `is_active`

**Goal:**
- Optimize filtering + aggregation queries

---

### 3. Pagination

- Default: 50 records per page
- Prevents rendering large datasets in UI

---

### 4. Debounced Search

- 300ms delay before API calls
- Reduces backend load

---

## ⚖️ Trade-offs & Decisions

### 1. No Caching Layer

**Why:**
- Dataset is small (10k)
- Queries are already fast

**Trade-off:**
- Recomputes analytics each time

**Future:**
- Add Redis or materialized views

---

### 2. No Background Jobs

**Why:**
- Real-time analytics is sufficient

**Trade-off:**
- No precomputation

---

### 3. LIKE-based Search

**Why:**
- Simple and sufficient for 10k rows

**Trade-off:**
- Not scalable to large datasets

**Future:**
- `pg_trgm` or full-text search

---

### 4. Single Database

**Why:**
- Simpler architecture

**Trade-off:**
- No horizontal scaling

---

## 🚨 Failure Scenarios

| Failure | Impact | Mitigation |
|--------|--------|-----------|
| DB slowdown | Slow analytics | Add indexes, caching |
| High read load | Latency increase | Read replicas |
| Large dataset (>100k) | Query slowdown | Partitioning, caching |

---

## 🔄 Evolution Plan

### Stage 1 (10k → 100k employees)
- Add `pg_trgm` index for search
- Introduce Redis caching for insights

---

### Stage 2 (100k → 1M employees)
- Read replicas for analytics queries
- Partition employees table by country

---

### Stage 3 (Advanced scale)

- Event-driven architecture:
  - Emit employee update events
  - Precompute aggregates asynchronously

- Store results in:
  - Materialized views
  - Aggregated tables

---

## 🧪 Testing Strategy

### Backend
- RSpec for:
  - Models
  - Request specs
  - Insights queries

### Frontend
- Vitest:
  - Utility functions
  - Hooks
  - Form validation

### Principles
- Deterministic data
- Fast execution
- Isolated tests

---

## 🧩 Why This Design Works

- Handles current scale efficiently (10k employees)
- Avoids premature complexity
- Leverages strengths of PostgreSQL
- Easy to evolve as requirements grow

---

## 🧠 Key Takeaways

- Database-first design significantly improves performance
- Simplicity enables faster development and maintainability
- Scalability should be incremental, not speculative

---

## ✅ Conclusion

This system is designed to be:

- **Simple enough** to build quickly
- **Robust enough** for real-world usage
- **Flexible enough** to scale

It balances product needs, engineering quality, and performance without unnecessary complexity.