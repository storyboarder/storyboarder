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

  private static final String DELETE_SQL = "DELETE FROM " + TABLE
      + "WHERE num = ?";

  private static final String UPDATE_NUMS_SQL = "UPDATE " + TABLE
      + " SET num = num - 1 WHERE num > ? AND num < ?";

  private static final String CHANGE_NUM_SQL = "UPDATE " + TABLE
      + " SET num = ? WHERE num = ?";

  private static final String SIZE_SQL = "SELECT * FROM " + TABLE;

  private static final int NUM = 1;
  private static final int JSON = 2;
  private static final int THUMBNAIL = 3;

  private static final String OUT_OF_BOUNDS_MSG =
      "pageNum must be at least 1 and less than or equal to the number of pages.";

  private final Connection conn;
  private final Path path;

  private int pageCount;

  StoryboarderProject(Path path) throws SQLException, ClassNotFoundException {
    this.path = path;
    Class.forName("org.sqlite.JDBC");
    conn = DriverManager.getConnection("jdbc:sqlite:" + path);
    Statement stat = conn.createStatement();
    stat.executeUpdate(TABLE_SQL);
    stat.close();
    pageCount = countPages();
  }

  private int countPages() {
    try (PreparedStatement prep = conn.prepareStatement(SIZE_SQL)) {
      ResultSet rs = prep.executeQuery();
      int i = 0;
      while (rs.next()) {
        i++;
      }
      return i;
    } catch (SQLException e) {
      e.printStackTrace();
      return -1;
    }
  }

  StoryboarderPage getPage(int pageNum) {
    throwIfOutOfBounds(pageNum);

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

  int getPageCount() {
    assert pageCount == countPages();
    return pageCount;
  }

  boolean savePage(StoryboarderPage page) {
    throwIfOutOfBounds(page.getNum());
    return saveOrAddPage(page);
  }

  boolean addPage(String json, String thumbnail) {
    assert pageCount == countPages();
    StoryboarderPage newPage = new StoryboarderPage(pageCount + 1, json,
        thumbnail);
    boolean result = saveOrAddPage(newPage);
    pageCount++;
    return result;
  }

  boolean addPage(StoryboarderPage page) {
    if (page.getNum() != pageCount + 1) {
      throw new IndexOutOfBoundsException(
          "When adding, index must be pageCount + 1");
    }
    boolean result = saveOrAddPage(page);
    pageCount++;
    return result;
  }

  boolean removePage(int pageNum) {
    throwIfOutOfBounds(pageNum);
    // delete the page
    try (PreparedStatement deletePrep = conn.prepareStatement(DELETE_SQL)) {
      deletePrep.setInt(NUM, pageNum);
      deletePrep.execute();
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }

    // update the other pages' indices
    try (PreparedStatement prep = conn.prepareStatement(UPDATE_NUMS_SQL)) {
      prep.setInt(NUM, pageNum);
      prep.setInt(NUM + 1, pageCount + 1);
      prep.execute();
      pageCount--;
      return true;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  boolean swapPages(int num1, int num2) {
    StoryboarderPage page1 = getPage(num1);
    StoryboarderPage page2 = getPage(num2);
    StoryboarderPage newPage1 = new StoryboarderPage(num1, page2.getJson(),
        page2.getThumbnail());
    StoryboarderPage newPage2 = new StoryboarderPage(num2, page1.getJson(),
        page1.getThumbnail());
    return savePage(newPage1) && savePage(newPage2);
  }

  boolean movePage(int pageNum, int newSpot) {
    throwIfOutOfBounds(pageNum);
    throwIfOutOfBounds(newSpot);

    if (pageNum > newSpot) {
      return movePageDown(pageNum, newSpot);
    } else if (pageNum < newSpot) {
      return movePageUp(pageNum, newSpot);
    } else {
      return true;
    }
  }

  private void changeNum(PreparedStatement prep, int oldNum, int newNum)
      throws SQLException {
    prep.setInt(1, newNum);
    prep.setInt(2, oldNum);
  }

  private boolean movePageDown(int pageNum, int newSpot) {
    assert pageNum > newSpot;

    try (PreparedStatement prep = conn.prepareStatement(CHANGE_NUM_SQL)) {
      changeNum(prep, pageNum, pageCount + 1);
      prep.addBatch();
      int index = pageNum;
      while (index >= newSpot) {
        changeNum(prep, index, index + 1);
        prep.addBatch();
        index--;
      }
      changeNum(prep, pageCount + 1, newSpot);
      prep.addBatch();
      prep.executeBatch();
      return true;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  private boolean movePageUp(int pageNum, int newSpot) {
    assert pageNum < newSpot;
    try (PreparedStatement prep = conn.prepareStatement(CHANGE_NUM_SQL)) {
      changeNum(prep, pageNum, -1);
      prep.execute();
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }

    try (PreparedStatement prep = conn.prepareStatement(UPDATE_NUMS_SQL)) {
      prep.setInt(NUM, pageNum);
      prep.setInt(NUM + 1, newSpot + 1);
      prep.execute();
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }

    try (PreparedStatement prep = conn.prepareStatement(CHANGE_NUM_SQL)) {
      changeNum(prep, -1, newSpot);
      prep.execute();
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }

    return true;
  }

  @Override
  public String toString() {
    assert pageCount == countPages();
    return path + ", number of pages: " + pageCount;
  }

  private boolean saveOrAddPage(StoryboarderPage page) {
    assert pageCount == countPages();
    if (page.getNum() >= 1 && page.getNum() <= pageCount + 1) {
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
      System.out.println("huh?");

      return false;
    }
  }

  private void throwIfOutOfBounds(int index) {
    if (!inBounds(index)) {
      throw new IndexOutOfBoundsException(OUT_OF_BOUNDS_MSG);
    }
  }

  private boolean inBounds(int index) {
    assert pageCount == countPages();

    return index >= 1 && index <= pageCount;
  }

}
