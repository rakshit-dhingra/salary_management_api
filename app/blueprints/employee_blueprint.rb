class EmployeeBlueprint < Blueprinter::Base
  identifier :id

  fields :first_name, :last_name, :email, :phone,
         :job_title, :department, :country, :city,
         :salary, :currency, :employment_type,
         :hire_date, :is_active, :created_at, :updated_at

  field :full_name
  field :tenure_years
end