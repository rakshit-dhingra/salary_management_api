# 🤖 AI Usage — Incubyte Salary Management Tool

This document describes how AI tools were used during the development of this project, and how outputs were validated and improved.

---

## 🎯 Approach

AI was used as a **productivity accelerator**, not as a decision-maker.

All generated code was:
- Reviewed and rewritten where needed
- Backed by tests (RSpec / Vitest)
- Validated against real data and edge cases

---

## 🧠 Where AI Helped

### 1. Initial Scaffolding

Used AI to speed up:
- Rails API project setup
- React + Vite frontend structure

**Impact:**
- Reduced setup time
- Allowed focus on core logic (filters, analytics)

**Manual changes:**
- Organized APIs under `/api/v1`
- Added Blueprinter instead of default serializers
- Structured controllers into `employees`, `insights`, `meta`

---

### 2. Employee Data Modeling

AI was used to brainstorm possible employee fields.

**Final model (manually refined):**
- `first_name`, `last_name`
- `email` (unique)
- `job_title`, `department`
- `country`
- `salary`, `currency`
- `employment_type`
- `hire_date`
- `is_active` (soft delete)

**Key decision:**
- Added `is_active` to avoid hard deletes and preserve analytics

---

### 3. SQL Analytics (Core Feature)

AI helped explore Postgres functions:

- `PERCENTILE_CONT` → salary percentiles
- `WIDTH_BUCKET` → histogram distribution

**What AI provided:**
- Basic query structures

**What was improved manually:**
- Correct grouping by country
- Ensured single-query aggregation (no Ruby loops)
- Added filters (`is_active = true`)
- Verified outputs using controlled test data

---

### 4. Seed Script Optimization

AI suggested bulk insert approaches.

**Final implementation:**
- `insert_all` with batches of 1000
- Deterministic random generator (`Random.new(42)`)
- Idempotency via unique email constraint

**Outcome:**
- 10,000 employees inserted in < 1 second

---

### 5. Backend Tests (RSpec)

AI helped generate initial test structure for:
- Employee CRUD APIs
- Filtering, sorting, pagination
- Insights endpoints

**Improvements made manually:**
- Added edge cases (empty results, invalid params)
- Ensured deterministic datasets
- Removed redundant test cases

---

### 6. Frontend Components

AI was used for:
- Initial form and table scaffolding

**Manual improvements:**
- Extracted reusable components (Modal, Toast, ConfirmDialog)
- Added debounced search (`useDebounce`)
- Centralized API calls (`api.js`)
- Improved UX with loading states and validation

---

### 7. Charts & Visualization

AI helped explore visualization options.

**Final choices:**
- Histogram → salary distribution
- Bar chart → avg salary by job title
- Donut chart → department breakdown

These were selected based on HR manager usability.

---

### 8. Documentation

AI was used to:
- Structure README sections
- Improve clarity of explanations

All content was manually verified against actual implementation.

---

## ⚠️ Where AI Was NOT Used

AI was intentionally NOT relied on for:

- Final architecture decisions
- Indexing strategy
- Performance optimizations
- Trade-off analysis

These decisions were made based on engineering judgment.

---

## 🔍 Validation

All AI-generated outputs were validated via:

- **Tests:** RSpec (backend), Vitest (frontend)
- **Manual testing:** UI flows and edge cases
- **Performance checks:** seed time and query efficiency

---

## ⚖️ Trade-offs of Using AI

| Benefit | Trade-off |
|--------|----------|
| Faster development | Requires careful validation |
| Quick exploration | May produce generic solutions |
| Reduces boilerplate | Needs manual refinement |

---

## 🧠 Key Takeaways

- AI is effective for **speed and exploration**
- Critical thinking is required for **correctness and performance**
- Tests are essential to validate AI outputs
- Best results come from **iterating on AI suggestions**

---

## ✅ Summary

AI accelerated development across scaffolding, testing, and SQL exploration.

However, the final system reflects:
- Intentional design decisions
- Optimized database usage
- Clean and maintainable architecture

This ensured the solution remains **production-quality, not AI-generated boilerplate**.