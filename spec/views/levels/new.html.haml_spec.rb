require 'spec_helper'

describe "levels/new" do
  before(:each) do
    assign(:level, stub_model(Level,
      :level => 1,
      :title => "MyString"
    ).as_new_record)
  end

  it "renders new level form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", levels_path, "post" do
      assert_select "input#level_level[name=?]", "level[level]"
      assert_select "input#level_title[name=?]", "level[title]"
    end
  end
end
