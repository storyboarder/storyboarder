package storyboarder;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import sqlutil.SqlString;

/**
 * Utility class containing methods for creating SQL strings, and getting
 * existing projects. Also stores basic information about Storyboarder,
 * including the path to the project folder, the file type of the database, and
 * the name of the table stored in each database.
 *
 * @author fbystric
 * @author ktsakas
 * @author narobins
 * @author yz38
 *
 */
public final class Projects {
  private static final Path PROJECT_FOLDER = Paths.get("projects");
  private static final String TABLE_NAME = "pages";
  private static final String FILE_TYPE = ".sqlite3";

  // private static Set<Path> pathChoices = getPathChoices();

  private Projects() {
    String message = "This class cannot have instances.";
    throw new UnsupportedOperationException(message);
  }

  /**
   * @return the path to the folder containing all the projects.
   */
  static Path projectFolder() {
    return PROJECT_FOLDER;
  }

  /**
   * @return the file type of the database.
   */
  static String fileType() {
    return FILE_TYPE;
  }

  /**
   * @return the name of the table stored in each database.
   */
  static String tableName() {
    return TABLE_NAME;
  }

  /**
   * @return an SQL string used to create the table used to store pages.
   */
  static String createTableSql() {
    String sql = "CREATE TABLE IF NOT EXISTS ? "
        + "(num INTEGER primary key, json TEXT, thumbnail TEXT);";
    return SqlString.of(sql, tableName()).getSql();
  }

  /**
   * @param pageNum
   *          The page that is being queried from the database.
   * @return an SQL string used to query that page from the database.
   */
  static String getPageSql(int pageNum) {
    String sql = "SELECT * FROM ? WHERE num = ?;";
    return SqlString.of(sql, tableName()).builder().addParam(pageNum).build()
        .getSql();
  }

  /**
   * @return an SQL string used to get all of the pages from the database.
   */
  static String getAllPagesSql() {
    String sql = "SELECT * FROM ?;";
    return SqlString.of(sql, tableName()).getSql();
  }

  /**
   * @param page
   *          the Page to save to the database.
   * @return an SQL string used to save that page.
   */
  static String savePageSql(Page page) {
    String sql = "REPLACE INTO ? VALUES (?, '?', '?');";
    SqlString.Builder builder = SqlString.of(sql, tableName()).builder();
    builder.addParam(page.getNum()).addParam(page.getJson())
    .addParam(page.getThumbnail());
    return builder.build().getSql();
  }

  /**
   * @param page
   *          the Page to add to the database.
   * @return an SQL string used to add that page to the database.
   */
  static String addPageSql(Page page) {
    String sql = "INSERT INTO ? VALUES (?, '?', '?');";
    SqlString.Builder builder = SqlString.of(sql, tableName()).builder();
    builder.addParam(page.getNum()).addParam(page.getJson())
        .addParam(page.getThumbnail());
    return builder.build().getSql();
  }

  /**
   * @param pageNum
   *          the number of the page to be deleted from the database.
   * @return an SQL string used to delete that page from the database.
   */
  static String deletePageSql(int pageNum) {
    String sql = "DELETE FROM ? WHERE num = ?;";
    return SqlString.of(sql, tableName()).builder().addParam(pageNum).build()
        .getSql();
  }

  /**
   * @param lower
   *          the lower bound.
   * @param upper
   *          the upper bound.
   * @return an SQL string used to decrement the number of each page between
   *         'lower' and 'upper', exclusive.
   */
  static String updateNumsSql(int lower, int upper) {
    String sql = "UPDATE ? SET num = num - 1 WHERE num > ? AND num < ?;";
    SqlString.Builder builder = SqlString.of(sql, tableName()).builder();
    builder.addParam(lower).addParam(upper);
    return builder.build().getSql();
  }

  /**
   * @param from
   *          The number to change.
   * @param to
   *          The number to change it to.
   * @return an SQL string used to change one page number to another.
   */
  static String changeNumSql(int from, int to) {
    String sql = "UPDATE ? SET num = ? WHERE num = ?";
    SqlString.Builder builder = SqlString.of(sql, tableName()).builder();
    builder.addParam(to).addParam(from);
    return builder.build().getSql();
  }

  /**
   * @return an SQL string used to count the number of pages in the database.
   */
  static String pageCountSql() {
    String sql = "SELECT COUNT(*) FROM ?";
    return SqlString.of(sql, tableName()).getSql();
  }

  /**
   * @return a mapping of project name to project for all of the existing
   *         projects in the project folder.
   */
  public static Map<String, Path> getProjects() {
    try {
      Files.createDirectories(Projects.projectFolder());
    } catch (IOException e) {
      System.err.println("ERROR creating necessary directories: "
          + e.getMessage());
    }
    Map<String, Path> projects = new HashMap<String, Path>();
    try (DirectoryStream<Path> choicesStream = Files
        .newDirectoryStream(Projects.projectFolder())) {
      Iterator<Path> choicesIterator = choicesStream.iterator();

      while (choicesIterator.hasNext()) {
        Path nextPath = choicesIterator.next();
        if (nextPath.toString().endsWith(Projects.fileType())) {
          String key = nextPath.getFileName().toString()
              .replace(fileType(), "");
          projects.put(key, nextPath);
        }
      }
      System.out.println(projects);
    } catch (IOException e) {
      System.err.println("ERROR: error getting possible projects: "
          + e.getMessage());
    }
    return projects;
  }

}
