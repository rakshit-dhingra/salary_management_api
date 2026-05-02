# app/services/salary_insights.rb
class SalaryInsights
  def self.country_stats(country)
    salaries = Employee.where(country: country).pluck(:salary)

    return { min: 0, max: 0, avg: 0 } if salaries.empty?

    {
      min: salaries.min,
      max: salaries.max,
      avg: salaries.sum / salaries.size
    }
  end
end