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
end
