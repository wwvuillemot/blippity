# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :question_answer do
    question "MyString"
    answer "MyString"
    count 1
    bonus 1
    level 1
  end
end
