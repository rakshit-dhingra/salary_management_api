Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :employees, only: [:index, :show, :create, :update, :destroy]

      namespace :insights do
        get :salary_by_country
        get :salary_by_job_title
        get :department_breakdown
        get :headcount_by_country
        get :salary_distribution
        get :top_earners
      end

      namespace :meta do
        get :countries
        get :job_titles
        get :departments
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
