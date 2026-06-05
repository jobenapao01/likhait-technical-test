class AddDateToExpenses < ActiveRecord::Migration[7.2]
  def up
    unless column_exists?(:expenses, :date)
      add_column :expenses, :date, :date
      execute "UPDATE expenses SET date = DATE(created_at) WHERE date IS NULL"
      change_column_null :expenses, :date, false
    end

    remove_column :expenses, :payer_name if column_exists?(:expenses, :payer_name)
  end

  def down
    add_column :expenses, :payer_name, :string, limit: 100, null: false, default: "Unknown"
    remove_column :expenses, :date
  end
end
