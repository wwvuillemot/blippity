class CreateLevels < ActiveRecord::Migration
  def change
    create_table :levels do |t|
      t.integer :level
      t.string :title
      t.integer :points_per_letter_right
      t.integer :points_per_letter_wrong
      t.integer :points_per_word_right
      t.integer :points_per_word_wrong
      t.integer :points_per_clear
      t.timestamps
    end
  end
end
