require 'spec_helper'

describe "levels/edit" do
  before(:each) do
    @level = assign(:level, stub_model(Level,
      :level => 1,
      :title => "MyString"
    ))
  end

  it "renders the edit level form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", level_path(@level), "post" do
      assert_select "input#level_level[name=?]", "level[level]"
      assert_select "input#level_title[name=?]", "level[title]"
    end
  end
end
