class Employee < ApplicationRecord
  validates :full_name, :country, presence: true
  validates :salary, numericality: { greater_than: 0 }
end
