package storyboarder;

class StoryboarderPage {
  private int num;
  private String json;
  private String thumbnail;

  StoryboarderPage(int num, String json, String thumbnail) {
    this.num = num;
    this.json = json;
    this.thumbnail = thumbnail;
  }

  int getNum() {
    return num;
  }

  String getJson() {
    return json;
  }

  String getThumbnail() {
    return thumbnail;
  }

  StoryboarderPage setNum(int num) {
    this.num = num;
    return this;
  }

  StoryboarderPage setJson(String json) {
    this.json = json;
    return this;
  }

  StoryboarderPage setThumbnail(String thumbnail) {
    this.thumbnail = thumbnail;
    return this;
  }

  static StoryboarderPage emptyPage() {
    return new StoryboarderPage(-1, "", "");
  }

  @Override
  public String toString() {
    return "{num: " + num + ", json: " + json + ", thumbnail: " + thumbnail
        + "}";
  }

  @Override
  public boolean equals(Object o) {
    if (o == this) {
      return true;
    } else if (!(o instanceof StoryboarderPage)) {
      return false;
    }
    StoryboarderPage x = (StoryboarderPage) o;

    return num == x.getNum() && json.equals(x.getJson())
        && thumbnail.equals(x.getThumbnail());

  }
}
