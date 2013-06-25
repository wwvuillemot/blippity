class QuestionAnswer < ActiveRecord::Base
  validates_presence_of :answer
  validates_presence_of :question
  validates_uniqueness_of :question
  validates_numericality_of :level, :only_integer => true, :greater_than_or_equal_to => 1
  validates_numericality_of :bonus, :only_integer => true, :greater_than_or_equal_to => 0
  validates_numericality_of :score, :only_integer => true, :greater_than_or_equal_to => 0
  
  attr_accessible :answer, :bonus, :level, :question, :score
  
  before_create :generate_bonus
  before_create :generate_score
  
  def generate_bonus
    self.bonus = self.answer.length * 10
  end

  def generate_score
    self.score = self.level * 10
  end
  
end