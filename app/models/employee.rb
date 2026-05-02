class Employee < ApplicationRecord
  validates :full_name, presence: true
end
