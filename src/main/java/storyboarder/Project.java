package storyboarder;

import java.nio.file.Path;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import sqlutil.ResultConverters;
import sqlutil.SqlQueryer;

/**
 * Represents a Storyboarder project. Stores pages of a project in a database
 * using their JSON strings.
 *
 * @author fbystric
 * @author ktsakas
 * @author narobins
 * @author yz38
 */
class Project implements AutoCloseable {

  private static final String OUT_OF_BOUNDS_MSG =
      "pageNum must be >= 1 and <= to the number of pages.";

  private final Path path;

  private final SqlQueryer queryer;

  /**
   * Constructs a project for the given path.
   *
   * @param path
   *          The path to the database that stores the project, or to the path
   *          where such a database is to be created.
   * @throws ClassNotFoundException
   *           if the class cannot be located
   *
   * @throws SQLException
   *           If a database access error occurs while connecting to the
   *           database.
   */
  Project(Path path) throws ClassNotFoundException, SQLException {
    this.path = path;
    queryer = new SqlQueryer(path);
    queryer.execute(Projects.createTableSql());
  }

  /**
   * @return the name of this project.
   */
  String name() {
    return path.getFileName().toString().replace(Projects.fileType(), "");
  }

  /**
   * @return the number of pages in this project.
   */
  int getPageCount() {
    return queryer.queryOne(Projects.pageCountSql(),
        ResultConverters.singleColumnConverter(1, Integer.class));
  }

  /**
   * @param pageNum
   *          the number of the page being requested.
   * @return The page with the number 'pageNum', or null if there is no such
   *         page.
   */
  Page getPage(int pageNum) {
    return queryer.queryOne(Projects.getPageSql(pageNum), new Page.Converter());
  }

  /**
   * @return a list of all the pages in this project.
   */
  List<Page> getAllPages() {
    return queryer.query(Projects.getAllPagesSql(), new Page.Converter());
  }

  /**
   * Saves a page to this project, replacing the existing page that had the same
   * page number.
   *
   * @param page
   *          The new page to store in this project.
   * @return True if the page was successfully saved, false otherwise.
   */
  boolean savePage(Page page) {
    throwIfOutOfBounds(page.getNum());
    return queryer.execute(Projects.savePageSql(page));
  }

  /**
   * Adds a page to this project, with page number equal to the number of pages
   * already in the project pluse 1.
   *
   * @param json
   *          The json string of the page to add.
   * @param thumbnail
   *          The thumbnail string of the page to add.
   * @return True if the page was successfully added, false otherwise.
   */
  boolean addPage(String json, String thumbnail) {
    Page newPage = new Page(getPageCount() + 1, json,
        thumbnail);
    return queryer.execute(Projects.addPageSql(newPage));
  }

  /**
   * Adds the given page to this project.
   *
   * @param page
   *          The page to be added to this project.
   * @return True if the page was successfully added, false otherwise.
   */
  boolean addPage(Page page) {
    if (page.getNum() != getPageCount() + 1) {
      throw new IndexOutOfBoundsException(
          "When adding, index must be pageCount + 1");
    }
    return queryer.execute(Projects.addPageSql(page));
  }

  /**
   * Removes a page from this project.
   *
   * @param pageNum
   *          The number of the page to be removed.
   * @return true if the page was successfully removed, false otherwise.
   */
  boolean removePage(int pageNum) {
    throwIfOutOfBounds(pageNum);

    if (!queryer.execute(Projects.deletePageSql(pageNum))) {
      return false;
    }
    return queryer.execute(Projects.updateNumsSql(pageNum, getPageCount() + 1));
  }

  /**
   * Changes a page's number to another, modifying the other pages if necessary.
   * This has the effect of moving the page up or down in the project.
   *
   * @param pageNum
   *          The number of the page to be moved.
   * @param newSpot
   *          The spot to which that page is to be moved.
   * @return true if the page was successfully moved, false otherwise.
   */
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

  /**
   * @see java.lang.Object#toString()
   * @return a string representation of this object.
   */
  @Override
  public String toString() {
    return path + ", number of pages: " + getPageCount();
  }

  /**
   * @see java.lang.AutoCloseable#close()
   * @throws Exception
   *           if this resource cannot be closed
   */
  @Override
  public void close() throws Exception {
    queryer.close();
  }

  /**
   * Checks if the given number is in the bounds of this project.
   *
   * @param index
   *          The index to be checked.
   * @return True if 'index' is greater than or equal to 1, and less than or
   *         equal to the number of pages in the project.
   */
  public boolean inBounds(int index) {
    return index >= 1 && index <= getPageCount();
  }

  /**
   * Checks if the given number is in the bounds of this project (as specified
   * by {@link #inBounds(int index)}, and throws an error if it isn't.
   *
   * @param index
   *          The index to be checked.
   * @throws IndexOutOfBoundsException
   *           if index is not in the bounds of the project.
   */
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
