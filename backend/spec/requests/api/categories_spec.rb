require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { Category.create!(name: "Food") }
    let!(:transport) { Category.create!(name: "Transport") }
    let!(:supplies) { Category.create!(name: "Supplies") }

    it "returns all categories" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Supplies")
    end

    it "returns categories in alphabetical order" do
      get "/api/categories"

      json = JSON.parse(response.body)
      expect(json.map { |c| c["name"] }).to eq([ "Food", "Supplies", "Transport" ])
    end
  end

  describe "POST /api/categories" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          data: {
            name: "Utilities"
          }
        }
      end

      it "creates a new category" do
        expect {
          post "/api/categories", params: valid_params, as: :json
        }.to change(Category, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Utilities")
        expect(json["id"]).to be_present
        expect(json["created_at"]).to be_present
        expect(json["updated_at"]).to be_present
      end
    end
  end

  describe "PUT /api/categories/:id" do
    let!(:category) { Category.create!(name: "Food") }

    it "updates the category" do
      put "/api/categories/#{category.id}", params: { data: { name: "Groceries" } }, as: :json

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["name"]).to eq("Groceries")
      expect(category.reload.name).to eq("Groceries")
    end
  end

  describe "DELETE /api/categories/:id" do
    let!(:category) { Category.create!(name: "Food") }

    it "deletes the category" do
      expect {
        delete "/api/categories/#{category.id}"
      }.to change(Category, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    context "when the category has associated expenses" do
      let!(:expense) do
        Expense.create!(description: "Lunch", amount: 100.00, category: category, date: Date.today)
      end

      it "deletes the category and its expenses" do
        expect {
          delete "/api/categories/#{category.id}"
        }.to change(Category, :count).by(-1)
          .and change(Expense, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end
  end
end
