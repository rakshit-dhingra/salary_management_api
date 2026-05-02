require 'rails_helper'

RSpec.describe "Employees", type: :request do
   
  it "creates an employee" do
    post "/employees", params: {
      employee: {
        full_name: "John Doe",
        job_title: "Engineer",
        country: "India",
        salary: 50000
      }
    }

    expect(response).to have_http_status(:created)
  end

  it "fetches employees" do
    Employee.create!(full_name: "A", job_title: "Dev", country: "India", salary: 100)

    get "/employees"
    expect(response).to have_http_status(:ok)
  end
end
