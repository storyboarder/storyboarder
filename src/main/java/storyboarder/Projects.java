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

  static Path projectFolder() {
    return PROJECT_FOLDER;
  }

  static String fileType() {
    return FILE_TYPE;
  }

  static String tableName() {
    return TABLE_NAME;
  }

  static String createTableSql() {
    String sql = "CREATE TABLE IF NOT EXISTS ? (num INTEGER primary key, json TEXT, thumbnail TEXT);";
    return SqlString.of(sql, tableName()).getSql();
  }

  static String getPageSql(int pageNum) {
    String sql = "SELECT * FROM ? WHERE num = ?;";
    return SqlString.of(sql, tableName()).builder().addParam(pageNum).build()
        .getSql();
  }

  static String getAllPagesSql() {
    String sql = "SELECT * FROM ?;";
    return SqlString.of(sql, tableName()).getSql();
  }

  static String savePageSql(Page page) {
    String sql = "REPLACE INTO ? VALUES (?, '?', '?');";
    SqlString.Builder builder = SqlString.of(sql, tableName()).builder();
    builder.addParam(page.getNum()).addParam(page.getJson())
    .addParam(page.getThumbnail());
    return builder.build().getSql();
  }

  static String addPageSql(Page page) {
    String sql = "INSERT INTO ? VALUES (?, '?', '?');";
    SqlString.Builder builder = SqlString.of(sql, tableName()).builder();
    builder.addParam(page.getNum()).addParam(page.getJson())
        .addParam(page.getThumbnail());
    return builder.build().getSql();
  }

  static String deletePageSql(int pageNum) {
    String sql = "DELETE FROM ? WHERE num = ?;";
    return SqlString.of(sql, tableName()).builder().addParam(pageNum).build()
        .getSql();
  }

  static String updateNumsSql(int lower, int upper) {
    String sql = "UPDATE ? SET num = num - 1 WHERE num > ? AND num < ?;";
    SqlString.Builder builder = SqlString.of(sql, tableName()).builder();
    builder.addParam(lower).addParam(upper);
    return builder.build().getSql();
  }

  static String changeNumSql(int from, int to) {
    String sql = "UPDATE ? SET num = ? WHERE num = ?";
    SqlString.Builder builder = SqlString.of(sql, tableName()).builder();
    builder.addParam(to).addParam(from);
    return builder.build().getSql();
  }

  static String pageCountSql() {
    String sql = "SELECT COUNT(*) FROM ?";
    return SqlString.of(sql, tableName()).getSql();
  }

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

  // private static Set<Path> getPathChoices() {
  // try {
  // Files.createDirectories(Projects.projectFolder());
  // } catch (IOException e) {
  // System.err.println("ERROR creating necessary directories: "
  // + e.getMessage());
  // }
  // Set<Path> pathChoices = new TreeSet<Path>();
  //
  // try (DirectoryStream<Path> choicesStream = Files
  // .newDirectoryStream(Projects.projectFolder())) {
  // Iterator<Path> choicesIterator = choicesStream.iterator();
  //
  // while (choicesIterator.hasNext()) {
  // Path nextPath = choicesIterator.next();
  // if (nextPath.toString().endsWith(Projects.fileType())) {
  // pathChoices.add(nextPath);
  // }
  // }
  // System.out.println(pathChoices);
  // } catch (IOException e) {
  // System.err.println("ERROR: error getting possible projects: "
  // + e.getMessage());
  // }
  // return pathChoices;
  // }
}
