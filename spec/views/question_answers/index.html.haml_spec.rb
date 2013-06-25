require 'spec_helper'

describe "question_answers/index" do
  before(:each) do
    assign(:question_answers, [
      stub_model(QuestionAnswer,
        :question => "Question",
        :answer => "Answer",
        :count => 1,
        :bonus => 2,
        :level => 3
      ),
      stub_model(QuestionAnswer,
        :question => "Question",
        :answer => "Answer",
        :count => 1,
        :bonus => 2,
        :level => 3
      )
    ])
  end

  it "renders a list of question_answers" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Question".to_s, :count => 2
    assert_select "tr>td", :text => "Answer".to_s, :count => 2
    assert_select "tr>td", :text => 1.to_s, :count => 2
    assert_select "tr>td", :text => 2.to_s, :count => 2
    assert_select "tr>td", :text => 3.to_s, :count => 2
  end
end
