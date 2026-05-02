require 'rails_helper'

RSpec.describe Employee, type: :model do
   it "is invalid without full_name" do
    employee = Employee.new(full_name: nil)
    expect(employee).to_not be_valid
  end

  it "is invalid with non-positive salary" do
    employee = Employee.new(full_name: "Test", salary: -10)
    expect(employee).to_not be_valid
  end

  it "is invalid without country" do
    employee = Employee.new(full_name: "Test", country: nil)
    expect(employee).to_not be_valid
  end

  it "is invalid without job_title" do
    employee = Employee.new(full_name: "Test", country: "INDIA", job_title: nil)
    expect(employee).to_not be_valid
  end
end
