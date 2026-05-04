# == Schema Information
#
# Table name: employees
#
#  id              :bigint           not null, primary key
#  first_name      :string           not null
#  last_name       :string           not null
#  email           :string           not null
#  phone           :string
#  job_title       :string           not null
#  department      :string           not null
#  country         :string           not null
#  city            :string
#  salary          :decimal(12, 2)   not null
#  currency        :string           default("USD"), not null
#  employment_type :string           default("Full-time"), not null
#  hire_date       :date             not null
#  is_active       :boolean          default(true), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null

class Employee < ApplicationRecord
  EMPLOYMENT_TYPES = %w[Full-time Part-time Contract Intern].freeze
  CURRENCIES       = %w[USD EUR GBP INR CAD AUD SGD JPY BRL MXN].freeze
  EMAIL_REGEX      = /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/i

  # ── Callbacks ───────────────────────────────────────────────────────────────
  before_validation :normalize_email

  # ── Validations ─────────────────────────────────────────────────────────────
  validates :first_name,      presence: true
  validates :last_name,       presence: true
  validates :email,           presence: true,
                              uniqueness: { case_sensitive: false },
                              format: { with: EMAIL_REGEX }
  validates :job_title,       presence: true
  validates :department,      presence: true
  validates :country,         presence: true
  validates :salary,          presence: true,
                              numericality: { greater_than: 0 }
  validates :hire_date,       presence: true
  validates :employment_type, inclusion: { in: EMPLOYMENT_TYPES }
  validates :currency,        inclusion: { in: CURRENCIES }

  # ── Scopes ──────────────────────────────────────────────────────────────────
  scope :active,        -> { where(is_active: true) }
  scope :inactive,      -> { where(is_active: false) }
  scope :by_country,    ->(c)  { where(country: c) }
  scope :by_department, ->(d)  { where(department: d) }
  scope :by_job_title,  ->(jt) { where("LOWER(job_title) = LOWER(?)", jt) }

  scope :search, ->(query) {
    term = "%#{query.downcase}%"
    where(
      "LOWER(first_name || ' ' || last_name) LIKE :q OR LOWER(email) LIKE :q OR LOWER(job_title) LIKE :q",
      q: term
    )
  }

  scope :recent_hires, ->(months: 3) {
    where("hire_date >= ?", months.months.ago.to_date)
  }

  # ── Instance Methods ─────────────────────────────────────────────────────────
  def full_name
    "#{first_name} #{last_name}"
  end

  def tenure_years
    ((Date.today - hire_date) / 365.25).floor
  end

  # ── Class Methods ────────────────────────────────────────────────────────────
  # Bulk insert for seeding — bypasses ActiveRecord callbacks for raw speed.
  # Returns the number of records inserted.
  def self.bulk_insert(records)
    return 0 if records.empty?

    now = Time.current
    rows = records.map do |r|
      r.merge(
        email:      r[:email].downcase,
        created_at: now,
        updated_at: now
      )
    end

    result = insert_all(rows, unique_by: :email)
    result.length
  end

  private

  def normalize_email
    self.email = email.to_s.downcase.strip
  end
end