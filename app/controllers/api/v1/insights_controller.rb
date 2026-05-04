module Api
  module V1
    class InsightsController < ApplicationController
      # GET /api/v1/insights/salary_by_country
      # Returns min/max/avg/percentiles and employee count per country.
      def salary_by_country
        rows = Employee.active
          .group(:country)
          .select(<<~SQL)
            country,
            COUNT(*)                            AS employee_count,
            ROUND(MIN(salary)::numeric, 2)      AS min_salary,
            ROUND(MAX(salary)::numeric, 2)      AS max_salary,
            ROUND(AVG(salary)::numeric, 2)      AS avg_salary,
            ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary)::numeric, 2) AS p25_salary,
            ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY salary)::numeric, 2) AS p50_salary,
            ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary)::numeric, 2) AS p75_salary,
            ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY salary)::numeric, 2) AS p90_salary
          SQL
          .order("employee_count DESC")

        render json: { data: rows.map { |r| format_country_row(r) } }
      end

      # GET /api/v1/insights/salary_by_job_title?country=
      # Returns salary stats per job title, optionally filtered by country.
      def salary_by_job_title
        scope = Employee.active
        scope = scope.by_country(params[:country]) if params[:country].present?

        rows = scope
          .group(:job_title)
          .select(<<~SQL)
            job_title,
            COUNT(*)                            AS employee_count,
            ROUND(MIN(salary)::numeric, 2)      AS min_salary,
            ROUND(MAX(salary)::numeric, 2)      AS max_salary,
            ROUND(AVG(salary)::numeric, 2)      AS avg_salary
          SQL
          .order("avg_salary DESC")

        render json: { data: rows.map { |r| format_job_title_row(r) } }
      end

      # GET /api/v1/insights/department_breakdown
      # Headcount, avg salary, and salary range per department.
      def department_breakdown
        rows = Employee.active
          .group(:department)
          .select(<<~SQL)
            department,
            COUNT(*)                            AS employee_count,
            ROUND(AVG(salary)::numeric, 2)      AS avg_salary,
            ROUND(MIN(salary)::numeric, 2)      AS min_salary,
            ROUND(MAX(salary)::numeric, 2)      AS max_salary
          SQL
          .order("employee_count DESC")

        render json: {
          data: rows.map { |r|
            {
              department:     r.department,
              employee_count: r.employee_count.to_i,
              avg_salary:     r.avg_salary.to_f,
              min_salary:     r.min_salary.to_f,
              max_salary:     r.max_salary.to_f
            }
          }
        }
      end

      # GET /api/v1/insights/headcount_by_country
      def headcount_by_country
        rows = Employee.active
          .group(:country)
          .select("country, COUNT(*) AS employee_count")
          .order("employee_count DESC")

        render json: {
          data: rows.map { |r| { country: r.country, employee_count: r.employee_count.to_i } }
        }
      end

      # GET /api/v1/insights/salary_distribution?country=&buckets=10
      # Builds a salary histogram with equal-width buckets.
      def salary_distribution
        scope = Employee.active
        scope = scope.by_country(params[:country]) if params[:country].present?

        bucket_count = [[params.fetch(:buckets, 10).to_i, 1].max, 50].min

        stats = scope.pick(
          "MIN(salary)::float",
          "MAX(salary)::float"
        )
        min_s, max_s = stats
        return render json: { data: [] } unless min_s

        width = ((max_s - min_s) / bucket_count.to_f)
        width = 1.0 if width.zero?  # all same salary edge case

        rows = scope.select(<<~SQL)
          WIDTH_BUCKET(salary, #{min_s}, #{max_s + 0.01}, #{bucket_count}) AS bucket,
          COUNT(*) AS count,
          ROUND(MIN(salary)::numeric, 0) AS bucket_min,
          ROUND(MAX(salary)::numeric, 0) AS bucket_max
        SQL
          .group("bucket")
          .order("bucket")

        data = rows.map do |r|
          {
            bucket:       r.bucket.to_i,
            bucket_label: "$#{format_k(r.bucket_min.to_f)} – $#{format_k(r.bucket_max.to_f)}",
            bucket_min:   r.bucket_min.to_f,
            bucket_max:   r.bucket_max.to_f,
            count:        r.count.to_i
          }
        end

        render json: { data: data }
      end

      # GET /api/v1/insights/top_earners?limit=10
      def top_earners
        limit = [[params.fetch(:limit, 10).to_i, 1].max, 100].min
        employees = Employee.active.order(salary: :desc).limit(limit)
        render json: { data: EmployeeBlueprint.render_as_hash(employees) }
      end

      private

      def format_country_row(r)
        {
          country:        r.country,
          employee_count: r.employee_count.to_i,
          min_salary:     r.min_salary.to_f,
          max_salary:     r.max_salary.to_f,
          avg_salary:     r.avg_salary.to_f,
          p25_salary:     r.p25_salary.to_f,
          p50_salary:     r.p50_salary.to_f,
          p75_salary:     r.p75_salary.to_f,
          p90_salary:     r.p90_salary.to_f
        }
      end

      def format_job_title_row(r)
        {
          job_title:      r.job_title,
          employee_count: r.employee_count.to_i,
          min_salary:     r.min_salary.to_f,
          max_salary:     r.max_salary.to_f,
          avg_salary:     r.avg_salary.to_f
        }
      end

      def format_k(val)
        val >= 1000 ? "#{(val / 1000).round(0)}k" : val.to_s
      end
    end
  end
end