package storyboarder;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import sqlUtil.SqlQueryer;

class Project {

  private static final String TABLE = "pages";

  private static final String TABLE_SQL = "CREATE TABLE IF NOT EXISTS "
      + TABLE + " (num INTEGER primary key, json TEXT, thumbnail TEXT)";

  private static final String UPDATE_NUMS_SQL = "UPDATE " + TABLE
      + " SET num = num - 1 WHERE num > ? AND num < ?";

  private static final String CHANGE_NUM_SQL = "UPDATE " + TABLE
      + " SET num = ? WHERE num = ?";

  private static final int NUM = 1;

  private static final String OUT_OF_BOUNDS_MSG =
      "pageNum must be at least 1 and less than or equal to the number of pages.";

  private final Connection conn;
  private final Path path;

  private final SqlQueryer queryer;

  Project(Path path) throws SQLException, ClassNotFoundException {
    this.path = path;
    Class.forName("org.sqlite.JDBC");
    conn = DriverManager.getConnection("jdbc:sqlite:" + path);
    queryer = new SqlQueryer(path);

    Statement stat = conn.createStatement();
    stat.executeUpdate(TABLE_SQL);
    stat.close();
  }

  int getPageCount() {
    try {
      ResultSet count = queryer.query(Projects.pageCountSql());
      if (count.next()) {
        return count.getInt(1);
      } else {
        System.err.println("ERROR during size query.");
        return -1;
      }
    } catch (SQLException e) {
      e.printStackTrace();
      return -1;
    }
  }

  Page getPage(int pageNum) {
    throwIfOutOfBounds(pageNum);

    try {
      ResultSet page = queryer.query(Projects.getPageSql(pageNum));
      if (page.next()) {
        int num = page.getInt(1);
        String json = page.getString(2);
        String thumbnail = page.getString(3);
        return new Page(num, json, thumbnail);
      } else {
        System.err.println("ERROR getting page.");
        return null;
      }
    } catch (SQLException e1) {
      e1.printStackTrace();
      return null;
    }
  }

  boolean savePage(Page page) {
    throwIfOutOfBounds(page.getNum());
    return queryer.execute(Projects.savePageSql(page));
  }

  boolean addPage(String json, String thumbnail) {
    Page newPage = new Page(getPageCount() + 1, json,
        thumbnail);
    return queryer.execute(Projects.addPageSql(newPage));
  }

  boolean addPage(Page page) {
    if (page.getNum() != getPageCount() + 1) {
      throw new IndexOutOfBoundsException(
          "When adding, index must be pageCount + 1");
    }
    return queryer.execute(Projects.addPageSql(page));
  }

  boolean removePage(int pageNum) {
    throwIfOutOfBounds(pageNum);

    if (!queryer.execute(Projects.deletePageSql(pageNum))) {
      return false;
    }
    return queryer.execute(Projects.updateNumsSql(pageNum, getPageCount() + 1));
  }

  boolean movePage(int pageNum, int newSpot) {
    throwIfOutOfBounds(pageNum);
    throwIfOutOfBounds(newSpot);

    if (pageNum > newSpot) {
      // TODO
      return movePageDown(pageNum, newSpot);
    } else if (pageNum < newSpot) {
      // TODO
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
      changeNum(prep, pageNum, getPageCount() + 1);
      prep.addBatch();
      int index = pageNum;
      while (index >= newSpot) {
        changeNum(prep, index, index + 1);
        prep.addBatch();
        index--;
      }
      changeNum(prep, getPageCount() + 1, newSpot);
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
    return path + ", number of pages: " + getPageCount();
  }

  private void throwIfOutOfBounds(int index) {
    if (!inBounds(index)) {
      throw new IndexOutOfBoundsException(OUT_OF_BOUNDS_MSG);
    }
  }

  public boolean inBounds(int index) {

    return index >= 1 && index <= getPageCount();
  }

}
