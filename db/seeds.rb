# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

question_answers = [
  ['marco', 'polo'],
  ['foo', 'bar']
]
question_answers.each do |question, answer|
  puts 'q:' + question + ' => a:' + answer
  QuestionAnswer.find_or_create_by_question_and_answer(question, answer)
end
