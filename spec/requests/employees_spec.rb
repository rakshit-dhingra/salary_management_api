require "rails_helper"

RSpec.describe "API::V1::Employees", type: :request do
  let(:valid_attrs) do
    {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane.doe@acme.com",
      job_title: "Software Engineer",
      department: "Engineering",
      country: "United States",
      city: "San Francisco",
      salary: 120_000.00,
      currency: "USD",
      employment_type: "Full-time",
      hire_date: "2022-01-15"
    }
  end

  # ── GET /api/v1/employees ────────────────────────────────────────────────────
  describe "GET /api/v1/employees" do
    before { create_list(:employee, 5) }

    it "returns 200 with a paginated list" do
      get "/api/v1/employees"
      expect(response).to have_http_status(:ok)
      expect(json_response[:data]).to be_an(Array)
      expect(json_response[:data].length).to eq(5)
    end

    it "includes pagination metadata" do
      get "/api/v1/employees"
      meta = json_response[:meta]
      expect(meta[:total_count]).to eq(5)
      expect(meta[:page]).to eq(1)
      expect(meta[:per_page]).to be_present
    end

    context "with pagination" do
      before { create_list(:employee, 20) }

      it "respects per_page param" do
        get "/api/v1/employees", params: { per_page: 5, page: 1 }
        expect(json_response[:data].length).to eq(5)
      end

      it "returns the correct page" do
        get "/api/v1/employees", params: { per_page: 5, page: 2 }
        expect(json_response[:meta][:page]).to eq(2)
      end
    end

    context "with filters" do
      let!(:us_emp) { create(:employee, country: "United States") }
      let!(:de_emp) { create(:employee, country: "Germany") }

      it "filters by country" do
        get "/api/v1/employees", params: { country: "United States" }
        ids = json_response[:data].map { |e| e[:id] }
        expect(ids).to include(us_emp.id)
        expect(ids).not_to include(de_emp.id)
      end

      it "filters by job_title" do
        engineer = create(:employee, job_title: "Software Engineer")
        get "/api/v1/employees", params: { job_title: "Software Engineer" }
        ids = json_response[:data].map { |e| e[:id] }
        expect(ids).to include(engineer.id)
      end

      it "filters by department" do
        eng = create(:employee, department: "Engineering")
        get "/api/v1/employees", params: { department: "Engineering" }
        ids = json_response[:data].map { |e| e[:id] }
        expect(ids).to include(eng.id)
      end

      it "filters by is_active" do
        inactive = create(:employee, is_active: false)
        get "/api/v1/employees", params: { is_active: "false" }
        ids = json_response[:data].map { |e| e[:id] }
        expect(ids).to include(inactive.id)
        expect(ids).not_to include(us_emp.id)
      end
    end

    context "with search" do
      it "searches by name" do
        alice = create(:employee, first_name: "Aliciana", last_name: "Unique")
        get "/api/v1/employees", params: { search: "Aliciana" }
        ids = json_response[:data].map { |e| e[:id] }
        expect(ids).to include(alice.id)
      end
    end

    context "with sorting" do
      it "sorts by salary ascending" do
        get "/api/v1/employees", params: { sort_by: "salary", sort_dir: "asc" }
        salaries = json_response[:data].map { |e| e[:salary].to_f }
        expect(salaries).to eq(salaries.sort)
      end

      it "sorts by salary descending" do
        get "/api/v1/employees", params: { sort_by: "salary", sort_dir: "desc" }
        salaries = json_response[:data].map { |e| e[:salary].to_f }
        expect(salaries).to eq(salaries.sort.reverse)
      end
    end
  end

  # ── GET /api/v1/employees/:id ────────────────────────────────────────────────
  describe "GET /api/v1/employees/:id" do
    let(:employee) { create(:employee) }

    it "returns the employee" do
      get "/api/v1/employees/#{employee.id}"
      expect(response).to have_http_status(:ok)
      expect(json_response[:data][:id]).to eq(employee.id)
      expect(json_response[:data][:email]).to eq(employee.email)
    end

    it "returns 404 for unknown id" do
      get "/api/v1/employees/999999"
      expect(response).to have_http_status(:not_found)
      expect(json_response[:error]).to be_present
    end
  end

  # ── POST /api/v1/employees ───────────────────────────────────────────────────
  describe "POST /api/v1/employees" do
    it "creates an employee and returns 201" do
      expect {
        post "/api/v1/employees",
          params: { employee: valid_attrs }.to_json,
          headers: { "Content-Type" => "application/json" }
      }.to change(Employee, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_response[:data][:email]).to eq("jane.doe@acme.com")
    end

    it "returns 422 with validation errors when invalid" do
      post "/api/v1/employees",
        params: { employee: { first_name: "" } }.to_json,
        headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json_response[:errors]).to be_present
    end

    it "normalises email to lowercase" do
      post "/api/v1/employees",
        params: { employee: valid_attrs.merge(email: "JANE@ACME.COM") }.to_json,
        headers: { "Content-Type" => "application/json" }

      expect(json_response[:data][:email]).to eq("jane@acme.com")
    end
  end

  # ── PUT /api/v1/employees/:id ────────────────────────────────────────────────
  describe "PUT /api/v1/employees/:id" do
    let(:employee) { create(:employee) }

    it "updates the employee and returns 200" do
      put "/api/v1/employees/#{employee.id}",
        params: { employee: { salary: 150_000 } }.to_json,
        headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:ok)
      expect(json_response[:data][:salary].to_f).to eq(150_000.0)
      expect(employee.reload.salary).to eq(150_000.0)
    end

    it "returns 422 for invalid attributes" do
      put "/api/v1/employees/#{employee.id}",
        params: { employee: { salary: -1 } }.to_json,
        headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 404 for unknown id" do
      put "/api/v1/employees/999999",
        params: { employee: { salary: 100 } }.to_json,
        headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:not_found)
    end
  end

  # ── DELETE /api/v1/employees/:id ─────────────────────────────────────────────
  describe "DELETE /api/v1/employees/:id" do
    let!(:employee) { create(:employee) }

    it "soft-deletes (deactivates) the employee and returns 200" do
      expect {
        delete "/api/v1/employees/#{employee.id}"
      }.not_to change(Employee, :count)

      expect(response).to have_http_status(:ok)
      expect(employee.reload.is_active).to be(false)
    end

    it "returns 404 for unknown id" do
      delete "/api/v1/employees/999999"
      expect(response).to have_http_status(:not_found)
    end
  end
end