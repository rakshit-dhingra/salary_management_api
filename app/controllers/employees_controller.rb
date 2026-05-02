class EmployeesController < ApplicationController

  def create
    employee = Employee.new(employee_params)
    if employee.save
      render json: employee, status: :created
    else
      render json: { errors: employee.errors }, status: :unprocessable_entity
    end
  end

  private

  def employee_params
    params.require(:employee).permit(:full_name, :job_title, :country, :salary)
  end
end
