class Level < ActiveRecord::Base
  has_many :question_answers
  attr_accessible :level, :title
  
end
