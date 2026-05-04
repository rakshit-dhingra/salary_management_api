module Api
  module V1
    class MetaController < ApplicationController
      # GET /api/v1/meta/countries
      def countries
        countries = Employee.active
          .distinct
          .order(:country)
          .pluck(:country)
          .compact

        render json: { data: countries }
      end

      # GET /api/v1/meta/job_titles
      def job_titles
        titles = Employee.active
          .distinct
          .order(:job_title)
          .pluck(:job_title)
          .compact

        render json: { data: titles }
      end

      # GET /api/v1/meta/departments
      def departments
        depts = Employee.active
          .distinct
          .order(:department)
          .pluck(:department)
          .compact

        render json: { data: depts }
      end
    end
  end
end