class CreateQuestionAnswers < ActiveRecord::Migration

  def change
    create_table :question_answers do |t|
      t.string :question
      t.string :answer
      t.integer :score, :default => 0
      t.integer :bonus, :default => 0
      t.references :level, :default => 1

      t.timestamps
    end
    
    add_index :question_answers, :level_id
  end  

end
