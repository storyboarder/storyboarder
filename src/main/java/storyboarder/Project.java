package storyboarder;

import java.nio.file.Path;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import sqlutil.ResultConverters;
import sqlutil.SqlQueryer;

class Project implements AutoCloseable {

  private static final String OUT_OF_BOUNDS_MSG =
      "pageNum must be >= 1 and <= to the number of pages.";

  private final Path path;

  private final SqlQueryer queryer;

  Project(Path path) throws ClassNotFoundException, SQLException {
    this.path = path;
    queryer = new SqlQueryer(path);
    queryer.execute(Projects.createTableSql());
  }

  String name() {
    return path.getFileName().toString().replace(Projects.fileType(), "");
  }

  int getPageCount() {
    return queryer.queryOne(Projects.pageCountSql(),
        ResultConverters.singleColumnConverter(1, Integer.class));
  }

  Page getPage(int pageNum) {
    throwIfOutOfBounds(pageNum);
    return queryer.queryOne(Projects.getPageSql(pageNum), new Page.Converter());
  }

  List<Page> getAllPages() {
    return queryer.query(Projects.getAllPagesSql(), new Page.Converter());
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
      return movePageDown(pageNum, newSpot);
    } else if (pageNum < newSpot) {
      return movePageUp(pageNum, newSpot);
    } else {
      return true;
    }
  }

  @Override
  public String toString() {
    return path + ", number of pages: " + getPageCount();
  }

  @Override
  public void close() throws Exception {
    queryer.close();
  }

  public boolean inBounds(int index) {
    return index >= 1 && index <= getPageCount();
  }

  private void throwIfOutOfBounds(int index) {
    if (!inBounds(index)) {
      throw new IndexOutOfBoundsException(OUT_OF_BOUNDS_MSG);
    }
  }

  private boolean movePageDown(int pageNum, int newSpot) {
    assert pageNum > newSpot;

    List<String> statements = new ArrayList<String>();

    statements.add(Projects.changeNumSql(pageNum, -1));
    for (int i = pageNum - 1; i >= newSpot; i--) {
      statements.add(Projects.changeNumSql(i, i + 1));
    }
    statements.add(Projects.changeNumSql(-1, newSpot));

    return queryer.executeBatch(statements);

  }

  private boolean movePageUp(int pageNum, int newSpot) {
    assert pageNum < newSpot;

    List<String> statements = new ArrayList<String>();
    statements.add(Projects.changeNumSql(pageNum, -1));
    for (int i = pageNum + 1; i <= newSpot; i++) {
      statements.add(Projects.changeNumSql(i, i - 1));
    }
    statements.add(Projects.changeNumSql(-1, newSpot));
    return queryer.executeBatch(statements);

  }

}
