package storyboarder;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;

import sqlUtil.SqlString;

public final class Projects {
  private static final Path PROJECT_FOLDER = Paths.get("projects");
  private static final String FILE_TYPE = ".sqlite3";

  private static Set<Path> pathChoices = getPathChoices();

  public static Path projectFolder() {
    return PROJECT_FOLDER;
  }

  public static String fileType() {
    return FILE_TYPE;
  }

  public static boolean addPathChoice(Path newChoice) {
    return pathChoices.add(newChoice);
  }

  public static Path getPathChoice(int choice) {
    return new ArrayList<Path>(pathChoices).get(choice);
  }

  public static Set<String> pathChoiceNames() {
    Set<String> names = new TreeSet<String>();
    for (Path choice : pathChoices) {
      String choiceName = choice.getFileName().toString();
      names.add(choiceName.replace(Projects.fileType(), ""));
    }
    return names;
  }

  static String tableName() {
    return "pages";
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

  static String changeNumsSql(int from, int to) {
    String sql = "UPDATE ? SET num = ? WHERE num = ?";
    SqlString.Builder builder = SqlString.of(sql, tableName()).builder();
    builder.addParam(to).addParam(from);
    return builder.build().getSql();
  }

  static String pageCountSql() {
    String sql = "SELECT COUNT(*) FROM ?";
    return SqlString.of(sql, tableName()).getSql();
  }

  private static Set<Path> getPathChoices() {
    try {
      Files.createDirectories(Projects.projectFolder());
    } catch (IOException e) {
      System.err.println("ERROR creating necessary directories: "
          + e.getMessage());
    }
    Set<Path> pathChoices = new TreeSet<Path>();

    try (DirectoryStream<Path> choicesStream = Files
        .newDirectoryStream(Projects.projectFolder())) {
      Iterator<Path> choicesIterator = choicesStream.iterator();

      while (choicesIterator.hasNext()) {
        Path nextPath = choicesIterator.next();
        if (nextPath.toString().endsWith(Projects.fileType())) {
          pathChoices.add(nextPath);
        }
      }
      System.out.println(pathChoices);
    } catch (IOException e) {
      System.err.println("ERROR: error getting possible projects: "
          + e.getMessage());
    }
    return pathChoices;
  }
}
