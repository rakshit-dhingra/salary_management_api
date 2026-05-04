module RequestHelper
  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end

  def json_body(data)
    { headers: { "Content-Type" => "application/json" }, params: data.to_json }
  end
end