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
  private int pageNum;
  private final String json;
  private final String thumbnail;

  /**
   * Constructs a StoryboarderPage with the given page number, json string, and
   * thumbnail string.
   *
   * @param pageNum
   *          The page number of this page.
   * @param json
   *          The json string containing all of the data for this page.
   * @param thumbnail
   *          The result of canvas.toDataURL, which can be turned into a
   *          thumbnail.
   */
  Page(int pageNum, String json, String thumbnail) {
    this.pageNum = pageNum;
    this.json = json;
    this.thumbnail = thumbnail;
  }

  /**
   * @return The page number of this page.
   */
  int getNum() {
    return pageNum;
  }

  void setNum(int pageNum) {
    this.pageNum = pageNum;
  }

  /**
   * @return The json string containing all of the data for this page.
   */
  String getJson() {
    return json;
  }

  /**
   * @return The result of canvas.toDataURL(), which can be turned into a
   *         thumbnail.
   */
  String getThumbnail() {
    return thumbnail;
  }

  /**
   * @see java.lang.Object#toString()
   * @return a string representation of this object.
   */
  @Override
  public String toString() {
    return "{num: " + pageNum + ", json: " + json + ", thumbnail: " + thumbnail
        + "}";
  }

  /**
   * @see java.lang.Object#hashCode()
   * @return a hash code value for this object.
   */
  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + json.hashCode();
    result = prime * result + pageNum;
    result = prime * result + thumbnail.hashCode();
    return result;
  }

  /**
   * @see java.lang.Object#equals(java.lang.Object)
   * @param obj
   *          the reference object with which to compare.
   * @return true if this object is the same as the obj argument; false
   *         otherwise.
   */
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
    return pageNum == o.getNum() && json.equals(o.getJson())
        && thumbnail.equals(o.getThumbnail());
  }

  /**
   * The {@link ResultConverter} for this Page.
   *
   * @author narobins
   * @author yz38
   * @author ktsakas
   * @author fbystric
   */
  static class Converter implements ResultConverter<Page> {

    private static final int NUM = 1;
    private static final int JSON = 2;
    private static final int THUMBNAIL = 3;

    /**
     * Converts one row of an SQL ResultSet to a Page object.
     *
     * @param rs
     *          The ResultSet containing pages.
     * @return The page at the row of the ResultSet currently being pointed to
     *         by the cursor.
     */
    @Override
    public Page convert(ResultSet rs) throws SQLException {
      return new Page(rs.getInt(NUM), rs.getString(JSON),
          rs.getString(THUMBNAIL));
    }

  }

}
