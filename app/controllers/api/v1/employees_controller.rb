module Api
  module V1
    class EmployeesController < ApplicationController
      ALLOWED_SORT_COLUMNS = %w[salary hire_date last_name first_name job_title country created_at].freeze
      DEFAULT_PER_PAGE     = 50
      MAX_PER_PAGE         = 200

      before_action :set_employee, only: [:show, :update, :destroy]

      # GET /api/v1/employees
      def index
        employees = Employee.all
        employees = apply_filters(employees)
        employees = apply_search(employees)
        employees = apply_sort(employees)

        total_count = employees.count

        page     = (params[:page]     || 1).to_i
        per_page = [(params[:per_page] || DEFAULT_PER_PAGE).to_i, MAX_PER_PAGE].min

        employees = employees.offset((page - 1) * per_page).limit(per_page)

        render json: {
          data: EmployeeBlueprint.render_as_hash(employees),
          meta: {
            total_count: total_count,
            page:        page,
            per_page:    per_page,
            total_pages: (total_count.to_f / per_page).ceil
          }
        }
      end

      # GET /api/v1/employees/:id
      def show
        render json: { data: EmployeeBlueprint.render_as_hash(@employee) }
      end

      # POST /api/v1/employees
      def create
        employee = Employee.new(employee_params)
        if employee.save
          render json: { data: EmployeeBlueprint.render_as_hash(employee) }, status: :created
        else
          render_errors(employee)
        end
      end

      # PUT /api/v1/employees/:id
      def update
        if @employee.update(employee_params)
          render json: { data: EmployeeBlueprint.render_as_hash(@employee) }
        else
          render_errors(@employee)
        end
      end

      # DELETE /api/v1/employees/:id
      # Soft delete — keeps record in DB for audit trail & analytics history.
      def destroy
        @employee.update!(is_active: false)
        render json: { message: "Employee deactivated successfully." }
      end

      private

      def set_employee
        @employee = Employee.find(params[:id])
      end

      def employee_params
        params.require(:employee).permit(
          :first_name, :last_name, :email, :phone,
          :job_title, :department, :country, :city,
          :salary, :currency, :employment_type,
          :hire_date, :is_active
        )
      end

      def apply_filters(scope)
        scope = scope.by_country(params[:country])         if params[:country].present?
        scope = scope.by_job_title(params[:job_title])     if params[:job_title].present?
        scope = scope.by_department(params[:department])   if params[:department].present?

        if params[:is_active].present?
          active = ActiveModel::Type::Boolean.new.cast(params[:is_active])
          scope = active ? scope.active : scope.inactive
        else
          scope = scope.active  # default: only show active employees
        end

        scope
      end

      def apply_search(scope)
        params[:search].present? ? scope.search(params[:search]) : scope
      end

      def apply_sort(scope)
        col = params[:sort_by].presence
        return scope.order(last_name: :asc) unless ALLOWED_SORT_COLUMNS.include?(col)

        dir = params[:sort_dir]&.downcase == "desc" ? :desc : :asc
        scope.order(col => dir)
      end
    end
  end
end