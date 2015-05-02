package storyboarder;

import java.sql.ResultSet;
import java.sql.SQLException;

import sqlutil.ResultConverter;

/**
 * Represents a page in a storyboarder project. Stores page number, the page's
 * json string, and the page's thumbnail.
 *
 * @author fbystric
 * @author ktsakas
 * @author narobins
 * @author yz38 *
 */
class Page {
  private final int num;
  private final String json;
  private final String thumbnail;

  /**
   * Constructs a StoryboarderPage with the given page number, json string, and
   * thumbnail string.
   *
   * @param num
   *          The page number of this page.
   * @param json
   *          The json string containing all of the data for this page.
   * @param thumbnail
   *          The result of canvas.toDataURL, which can be turned into a
   *          thumbnail.
   */
  Page(int num, String json, String thumbnail) {
    this.num = num;
    this.json = json;
    this.thumbnail = thumbnail;
  }

  /**
   * @return The page number of this page.
   */
  int getNum() {
    return num;
  }

  /**
   * @return The json string containing all of the data for this page.
   */
  String getJson() {
    return json;
  }

  /**
   * @return The result of canvas.toDataURL, which can be turned into a
   *         thumbnail.
   */
  String getThumbnail() {
    return thumbnail;
  }

  @Override
  public String toString() {
    return "{num: " + num + ", json: " + json + ", thumbnail: " + thumbnail
        + "}";
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + json.hashCode();
    result = prime * result + num;
    result = prime * result + thumbnail.hashCode();
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) {
      return true;
    }
    if (obj == null) {
      return false;
    }
    if (!(obj instanceof Page)) {
      return false;
    }
    Page o = (Page) obj;
    return num == o.getNum() && json.equals(o.getJson())
        && thumbnail.equals(o.getThumbnail());
  }

  static class Converter implements ResultConverter<Page> {

    private static final int NUM = 1;
    private static final int JSON = 2;
    private static final int THUMBNAIL = 3;

    @Override
    public Page convert(ResultSet rs) throws SQLException {
      return new Page(rs.getInt(NUM), rs.getString(JSON),
          rs.getString(THUMBNAIL));
    }

  }

}
