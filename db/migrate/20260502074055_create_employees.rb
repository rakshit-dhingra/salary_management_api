class CreateEmployees < ActiveRecord::Migration[7.1]
  def change
    create_table :employees do |t|
      # Identity
      t.string  :first_name,       null: false
      t.string  :last_name,        null: false
      t.string  :email,            null: false
      t.string  :phone

      # Role
      t.string  :job_title,        null: false
      t.string  :department,       null: false

      # Location
      t.string  :country,          null: false
      t.string  :city

      # Compensation
      t.decimal :salary,           null: false, precision: 12, scale: 2
      t.string  :currency,         null: false, default: "USD"
      t.string  :employment_type,  null: false, default: "Full-time"

      # Dates
      t.date    :hire_date,        null: false

      # Status
      t.boolean :is_active,        null: false, default: true

      t.timestamps
    end

    # --- Indexes for fast analytics queries ---
    add_index :employees, :email,            unique: true
    add_index :employees, :country
    add_index :employees, :job_title
    add_index :employees, :department
    add_index :employees, :is_active
    add_index :employees, %i[country job_title],  name: "idx_employees_country_job_title"
    add_index :employees, %i[country is_active],  name: "idx_employees_country_active"
    add_index :employees, :hire_date
  end
end