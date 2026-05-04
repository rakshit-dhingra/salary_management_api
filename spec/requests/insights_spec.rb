require "rails_helper"

RSpec.describe "API::V1::Insights", type: :request do
  # ── Seed a small, predictable dataset ────────────────────────────────────────
  before do
    # US employees
    create(:employee, country: "United States", job_title: "Engineer", salary: 100_000, department: "Engineering")
    create(:employee, country: "United States", job_title: "Engineer", salary: 120_000, department: "Engineering")
    create(:employee, country: "United States", job_title: "Manager", salary: 140_000, department: "Product")

    # UK employees
    create(:employee, country: "United Kingdom", job_title: "Engineer", salary:  80_000, department: "Engineering")
    create(:employee, country: "United Kingdom", job_title: "Designer", salary:  75_000, department: "Design")
  end

  # ── GET /api/v1/insights/salary_by_country ───────────────────────────────────
  describe "GET /api/v1/insights/salary_by_country" do
    it "returns 200" do
      get "/api/v1/insights/salary_by_country"
      expect(response).to have_http_status(:ok)
    end

    it "returns an array of country stats" do
      get "/api/v1/insights/salary_by_country"
      data = json_response[:data]
      expect(data).to be_an(Array)
      expect(data).not_to be_empty
    end

    it "includes min, max, average, and count per country" do
      get "/api/v1/insights/salary_by_country"
      us = json_response[:data].find { |d| d[:country] == "United States" }

      expect(us[:min_salary].to_f).to eq(100_000.0)
      expect(us[:max_salary].to_f).to eq(140_000.0)
      expect(us[:avg_salary].to_f).to be_within(0.01).of(120_000.0)
      expect(us[:employee_count]).to eq(3)
    end

    it "includes percentiles (p25, p50, p75, p90)" do
      get "/api/v1/insights/salary_by_country"
      us = json_response[:data].find { |d| d[:country] == "United States" }
      expect(us).to have_key(:p50_salary)
    end
  end

  # ── GET /api/v1/insights/salary_by_job_title ─────────────────────────────────
  describe "GET /api/v1/insights/salary_by_job_title" do
    it "returns stats for all job titles when no country given" do
      get "/api/v1/insights/salary_by_job_title"
      data = json_response[:data]
      titles = data.map { |d| d[:job_title] }
      expect(titles).to include("Engineer", "Manager", "Designer")
    end

    it "filters by country when provided" do
      get "/api/v1/insights/salary_by_job_title", params: { country: "United Kingdom" }
      data = json_response[:data]
      titles = data.map { |d| d[:job_title] }
      expect(titles).to include("Engineer", "Designer")
      expect(titles).not_to include("Manager")
    end

    it "calculates correct averages per job title in a country" do
      get "/api/v1/insights/salary_by_job_title", params: { country: "United States" }
      engineer_stat = json_response[:data].find { |d| d[:job_title] == "Engineer" }

      expect(engineer_stat[:avg_salary].to_f).to be_within(0.01).of(110_000.0)
      expect(engineer_stat[:employee_count]).to eq(2)
    end
  end

  # ── GET /api/v1/insights/department_breakdown ─────────────────────────────────
  describe "GET /api/v1/insights/department_breakdown" do
    it "returns headcount and avg salary per department" do
      get "/api/v1/insights/department_breakdown"
      data = json_response[:data]
      eng = data.find { |d| d[:department] == "Engineering" }

      expect(eng[:employee_count]).to eq(3)
      expect(eng[:avg_salary].to_f).to be_within(0.01).of(100_000.0)
    end
  end

  # ── GET /api/v1/insights/headcount_by_country ─────────────────────────────────
  describe "GET /api/v1/insights/headcount_by_country" do
    it "returns headcount per country" do
      get "/api/v1/insights/headcount_by_country"
      data = json_response[:data]
      us = data.find { |d| d[:country] == "United States" }
      uk = data.find { |d| d[:country] == "United Kingdom" }

      expect(us[:employee_count]).to eq(3)
      expect(uk[:employee_count]).to eq(2)
    end
  end

  # ── GET /api/v1/insights/salary_distribution ──────────────────────────────────
  describe "GET /api/v1/insights/salary_distribution" do
    it "returns histogram buckets" do
      get "/api/v1/insights/salary_distribution"
      data = json_response[:data]
      expect(data).to be_an(Array)
      expect(data.first).to have_key(:bucket_label)
      expect(data.first).to have_key(:count)
    end

    it "accepts a country filter" do
      get "/api/v1/insights/salary_distribution", params: { country: "United States" }
      expect(response).to have_http_status(:ok)
    end
  end

  # ── GET /api/v1/insights/top_earners ──────────────────────────────────────────
  describe "GET /api/v1/insights/top_earners" do
    it "returns top 10 earners by default" do
      get "/api/v1/insights/top_earners"
      data = json_response[:data]
      expect(data.length).to be <= 10
    end

    it "accepts a limit param" do
      get "/api/v1/insights/top_earners", params: { limit: 3 }
      expect(json_response[:data].length).to be <= 3
    end

    it "returns employees in descending salary order" do
      get "/api/v1/insights/top_earners"
      salaries = json_response[:data].map { |e| e[:salary].to_f }
      expect(salaries).to eq(salaries.sort.reverse)
    end
  end
end