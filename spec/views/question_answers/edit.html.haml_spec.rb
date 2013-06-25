require 'spec_helper'

describe "question_answers/edit" do
  before(:each) do
    @question_answer = assign(:question_answer, stub_model(QuestionAnswer,
      :question => "MyString",
      :answer => "MyString",
      :count => 1,
      :bonus => 1,
      :level => 1
    ))
  end

  it "renders the edit question_answer form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", question_answer_path(@question_answer), "post" do
      assert_select "input#question_answer_question[name=?]", "question_answer[question]"
      assert_select "input#question_answer_answer[name=?]", "question_answer[answer]"
      assert_select "input#question_answer_count[name=?]", "question_answer[count]"
      assert_select "input#question_answer_bonus[name=?]", "question_answer[bonus]"
      assert_select "input#question_answer_level[name=?]", "question_answer[level]"
    end
  end
end
