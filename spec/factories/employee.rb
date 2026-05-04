FactoryBot.define do
  factory :employee do
    first_name      { Faker::Name.first_name }
    last_name       { Faker::Name.last_name }
    sequence(:email) { |n| "#{first_name.downcase}.#{last_name.downcase}#{n}@example.com" }
    phone           { Faker::PhoneNumber.phone_number }
    job_title       { Faker::Job.title }
    department      { %w[Engineering Product Design Sales Marketing HR Finance Operations].sample }
    country         { Faker::Address.country }
    city            { Faker::Address.city }
    salary          { Faker::Number.decimal(l_digits: 5, r_digits: 2).to_f }
    currency        { "USD" }
    employment_type { "Full-time" }
    hire_date       { Faker::Date.between(from: 5.years.ago, to: Date.today) }
    is_active       { true }

    trait :inactive do
      is_active { false }
    end

    trait :contractor do
      employment_type { "Contract" }
    end

    trait :high_earner do
      salary { Faker::Number.between(from: 150_000, to: 500_000).to_f }
    end

    trait :us_based do
      country  { "United States" }
      currency { "USD" }
    end

    trait :uk_based do
      country  { "United Kingdom" }
      currency { "GBP" }
    end
  end
end