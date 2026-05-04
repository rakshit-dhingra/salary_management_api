require "rails_helper"

RSpec.describe Employee, type: :model do
  subject(:employee) { build(:employee) }

  # ── Associations ────────────────────────────────────────────────────────────
  # (none for now; extend as org grows)

  # ── Validations ─────────────────────────────────────────────────────────────
  describe "validations" do
    it { is_expected.to be_valid }

    it { is_expected.to validate_presence_of(:first_name) }
    it { is_expected.to validate_presence_of(:last_name) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to validate_presence_of(:job_title) }
    it { is_expected.to validate_presence_of(:department) }
    it { is_expected.to validate_presence_of(:country) }
    it { is_expected.to validate_presence_of(:salary) }
    it { is_expected.to validate_presence_of(:hire_date) }

    it { is_expected.to validate_numericality_of(:salary).is_greater_than(0) }

    it "is invalid with a negative salary" do
      employee.salary = -1000
      expect(employee).not_to be_valid
      expect(employee.errors[:salary]).to include("must be greater than 0")
    end

    it "is invalid with a malformed email" do
      employee.email = "not-an-email"
      expect(employee).not_to be_valid
      expect(employee.errors[:email]).to be_present
    end

    it "normalises email to lowercase before save" do
      employee.email = "Alice@Example.COM"
      employee.save!
      expect(employee.reload.email).to eq("alice@example.com")
    end

    it "is invalid with an unrecognised employment type" do
      employee.employment_type = "Wizard"
      expect(employee).not_to be_valid
    end

    it "is invalid with an unrecognised currency" do
      employee.currency = "ZZZ"
      expect(employee).not_to be_valid
    end
  end

  # ── Scopes ──────────────────────────────────────────────────────────────────
  describe "scopes" do
    describe ".active" do
      it "returns only active employees" do
        active = create(:employee)
        inactive = create(:employee, is_active: false)

        result = Employee.active
        expect(result).to include(active)
        expect(result).not_to include(inactive)
      end
    end

    describe ".by_country" do
      it "filters employees by country" do
        us_employee = create(:employee, country: "United States")
        de_employee = create(:employee, country: "Germany")

        expect(Employee.by_country("United States")).to include(us_employee)
        expect(Employee.by_country("United States")).not_to include(de_employee)
      end
    end

    describe ".by_job_title" do
      it "filters employees by job title (case-insensitive)" do
        engineer = create(:employee, job_title: "Software Engineer")
        manager  = create(:employee, job_title: "Product Manager")

        expect(Employee.by_job_title("software engineer")).to include(engineer)
        expect(Employee.by_job_title("software engineer")).not_to include(manager)
      end
    end

    describe ".search" do
      it "matches on full name" do
        alice = create(:employee, first_name: "Alice", last_name: "Walker")
        bob   = create(:employee, first_name: "Bob", last_name: "Jones")

        expect(Employee.search("Alice")).to include(alice)
        expect(Employee.search("Alice")).not_to include(bob)
      end

      it "matches on email" do
        emp = create(:employee, email: "charlie@acme.com")
        expect(Employee.search("charlie@acme")).to include(emp)
      end

      it "is case insensitive" do
        emp = create(:employee, first_name: "Diana")
        expect(Employee.search("diana")).to include(emp)
      end
    end
  end

  # ── Instance Methods ────────────────────────────────────────────────────────
  describe "#full_name" do
    it "concatenates first and last name" do
      employee.first_name = "Jane"
      employee.last_name  = "Doe"
      expect(employee.full_name).to eq("Jane Doe")
    end
  end

  describe "#tenure_years" do
    it "returns years since hire_date" do
      employee.hire_date = 3.years.ago.to_date
      expect(employee.tenure_years).to eq(3)
    end
  end
end