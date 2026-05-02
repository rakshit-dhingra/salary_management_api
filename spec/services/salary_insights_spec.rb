# spec/services/salary_insights_spec.rb
require 'rails_helper'

RSpec.describe "SalaryInsights" do
  it "calculates min, max, avg salary by country" do
    Employee.create!(full_name: "A", job_title: "Dev", country: "India", salary: 100)
    Employee.create!(full_name: "B", job_title: "Dev", country: "India", salary: 200)

    result = SalaryInsights.country_stats("India")

    expect(result[:min]).to eq(100)
    expect(result[:max]).to eq(200)
    expect(result[:avg]).to eq(150)
  end
end