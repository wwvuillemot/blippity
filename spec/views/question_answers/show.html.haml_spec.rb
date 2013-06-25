require 'spec_helper'

describe "question_answers/show" do
  before(:each) do
    @question_answer = assign(:question_answer, stub_model(QuestionAnswer,
      :question => "Question",
      :answer => "Answer",
      :count => 1,
      :bonus => 2,
      :level => 3
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Question/)
    rendered.should match(/Answer/)
    rendered.should match(/1/)
    rendered.should match(/2/)
    rendered.should match(/3/)
  end
end
