# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_05_02_074055) do
  create_table "employees", force: :cascade do |t|
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email", null: false
    t.string "phone"
    t.string "job_title", null: false
    t.string "department", null: false
    t.string "country", null: false
    t.string "city"
    t.decimal "salary", precision: 12, scale: 2, null: false
    t.string "currency", default: "USD", null: false
    t.string "employment_type", default: "Full-time", null: false
    t.date "hire_date", null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["country", "is_active"], name: "idx_employees_country_active"
    t.index ["country", "job_title"], name: "idx_employees_country_job_title"
    t.index ["country"], name: "index_employees_on_country"
    t.index ["department"], name: "index_employees_on_department"
    t.index ["email"], name: "index_employees_on_email", unique: true
    t.index ["hire_date"], name: "index_employees_on_hire_date"
    t.index ["is_active"], name: "index_employees_on_is_active"
    t.index ["job_title"], name: "index_employees_on_job_title"
  end

end
