# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

levels = [
  [1, 'Crazy Town', 20, -10, 40, -30, 20],
  [2, 'Games',      30, -20, 50, -40, 40],
  [3, 'Tolkien',    40, -30, 60, -50, 80],
]

levels.each do |level_number, title, points_per_letter_right, points_per_letter_wrong, points_per_word_right, points_per_word_wrong, points_per_clear|
  puts title + ' (' + level_number.to_s + ')'
  level = Level.find_or_create_by_level(level_number)
  level.title = title
  level.points_per_letter_right = points_per_letter_right
  level.points_per_letter_wrong = points_per_letter_wrong
  level.points_per_word_right = points_per_word_right
  level.points_per_word_wrong = points_per_word_wrong
  level.points_per_clear = points_per_clear
  level.save!
end

question_answers = [
  ['marco', 'polo', 1],
  ['foo', 'bar', 1],
  ['assassins', 'creed', 2],
  ['dragon', 'quest', 2],
  ['frodo', 'baggins', 3],
  ['gandalf the', 'grey', 3],
]
question_answers.each do |question, answer, level_number|
  puts 'q:' + question + ' => a:' + answer + ' (' + level_number.to_s + ')'
  q_and_a = QuestionAnswer.find_or_create_by_question_and_answer(question, answer)
  q_and_a.level_id = level_number.to_i
  q_and_a.save!
end
