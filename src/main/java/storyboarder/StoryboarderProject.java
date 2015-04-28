package storyboarder;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

class StoryboarderProject {

  private static final String TABLE = "pages";

  private static final String TABLE_SQL = "CREATE TABLE IF NOT EXISTS "
      + TABLE + " (num INTEGER primary key, json TEXT, thumbnail TEXT)";

  private static final String GET_SQL = "SELECT * FROM " + TABLE
      + " WHERE num = ?";

  private static final String SAVE_ADD_SQL = "INSERT OR REPLACE INTO "
      + TABLE + " VALUES (?, ?, ?)";

  private static final String SIZE_SQL = "SELECT * FROM " + TABLE;

  private static final int NUM = 1;
  private static final int JSON = 2;
  private static final int THUMBNAIL = 3;

  private static final String OUT_OF_BOUNDS_MSG =
      "pageNum must be at least 1 and less than or equal to the number of pages.";

  private final Connection conn;
  private final Path path;

  StoryboarderProject(Path path) throws SQLException, ClassNotFoundException {
    this.path = path;
    Class.forName("org.sqlite.JDBC");
    conn = DriverManager.getConnection("jdbc:sqlite:" + path);
    Statement stat = conn.createStatement();
    stat.executeUpdate(TABLE_SQL);
    stat.close();
  }

  int numberOfPages() {
    try (PreparedStatement prep = conn.prepareStatement(SIZE_SQL)) {
      ResultSet rs = prep.executeQuery();
      int i = 0;
      while (rs.next()) {
        i++;
      }
      return i;
    } catch (SQLException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return -1;
  }

  StoryboarderPage getPage(int pageNum) {
    if (!inBounds(pageNum)) {
      throw new IndexOutOfBoundsException(OUT_OF_BOUNDS_MSG);
    }

    try (PreparedStatement prep = conn.prepareStatement(GET_SQL)) {
      prep.setInt(NUM, pageNum);
      ResultSet rs = prep.executeQuery();
      if (rs.next()) {
        int num = rs.getInt(1);
        String json = rs.getString(2);
        String thumbnail = rs.getString(3);
        return new StoryboarderPage(num, json, thumbnail);
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  boolean savePage(StoryboarderPage page) {
    if (!inBounds(page.getNum())) {
      throw new IndexOutOfBoundsException(OUT_OF_BOUNDS_MSG);
    }
    return saveOrAddPage(page);
  }

  boolean addPage(String json, String thumbnail) {
    int nextIndex = numberOfPages() + 1;
    StoryboarderPage newPage = new StoryboarderPage(nextIndex, json, thumbnail);
    return saveOrAddPage(newPage);
  }

  boolean addPage(StoryboarderPage page) {
    if (page.getNum() != numberOfPages() + 1) {
      throw new IndexOutOfBoundsException("page num is incorrect");
    }
    return saveOrAddPage(page);
  }

  boolean swapPages(int num1, int num2) {
    // TODO
    return false;
  }

  boolean removePage(int pageNum) {
    // TODO
    return false;
  }

  @Override
  public String toString() {
    return path + ", number of pages: " + numberOfPages();
  }

  private boolean saveOrAddPage(StoryboarderPage page) {
    if (page.getNum() >= 1 && page.getNum() <= numberOfPages() + 1) {
      try (PreparedStatement prep = conn.prepareStatement(SAVE_ADD_SQL)) {
        prep.setInt(NUM, page.getNum());
        prep.setString(JSON, page.getJson());
        prep.setString(THUMBNAIL, page.getThumbnail());
        prep.execute();
      } catch (SQLException e) {
        e.printStackTrace();
      }
      return true;
    } else {
      return false;
    }
  }

  private boolean inBounds(int index) {
    return index >= 1 && index <= numberOfPages();
  }

}
