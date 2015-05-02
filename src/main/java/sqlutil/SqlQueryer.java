package sqlutil;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Handles queries to an SQL database.
 *
 * @author narobins
 * @author yz38
 * @author ktsakas
 * @author fbystric
 */
public class SqlQueryer {
  private final Connection conn;

  /**
   * Constructs an SqlQueryer with a connection to the database at 'path.' If no
   * such database exists, it is created.
   *
   * @param path
   *          The path to the database, or to where the caller desires to create
   *          a database.
   * @throws ClassNotFoundException
   *           if the class cannot be located
   * @throws SQLException
   *           If a database access error occurs while connecting to the
   *           database.
   */
  public SqlQueryer(Path path) throws ClassNotFoundException, SQLException {
    Class.forName("org.sqlite.JDBC");
    conn = DriverManager.getConnection("jdbc:sqlite:" + path);
    assert Files.exists(path);
  }

  /**
   * Executes a query and returns a list of results.
   *
   * @param query
   *          The SQL query to be executed.
   * @param converter
   *          The ResultConverter that converts each row of the ResultSet to the
   *          desired object.
   * @return A list of results of the type returned by 'converter,' or null if
   *         an error occurs while querying the database.
   */
  public <T> List<T> query(String query, ResultConverter<T> converter) {
    try (PreparedStatement prep = conn.prepareStatement(query)) {
      List<T> results = new ArrayList<T>();
      ResultSet rs = prep.executeQuery();
      while (rs.next()) {
        results.add(converter.convert(rs));
      }
      return results;
    } catch (SQLException e) {
      e.printStackTrace();
      return null;
    }
  }

  /**
   * Executes a query with only one expected row in the ResultSet, and returns
   * that result.
   *
   * @param query
   *          The SQL query to be executed.
   * @param converter
   *          The ResultConverter that converts the row of the ResultSet to the
   *          desired object.
   * @return The object created by 'converter' from the single ResultSet row.
   */
  public <T> T queryOne(String query, ResultConverter<T> converter) {
    try (PreparedStatement prep = conn.prepareStatement(query)) {
      ResultSet rs = prep.executeQuery();
      if (rs.next()) {
        return converter.convert(rs);
      }
    } catch (SQLException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * Executes a single SQL statement.
   *
   * @param statement
   *          The SQL statement to be executed.
   * @return true if the statement executed successfully, false otherwise.
   */
  public boolean execute(String statement) {
    try (Statement stat = conn.createStatement()) {
      stat.execute(statement);
      return true;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  /**
   * Efficiently executes a list of SQL statements.
   *
   * @param statements
   *          The list of SQL statements to be executed.
   * @return true if all the statements executed successfully, false otherwise.
   */
  public boolean executeBatch(Collection<String> statements) {
    try (Statement stat = conn.createStatement()) {
      for (String statement : statements) {
        stat.addBatch(statement);
      }
      stat.executeBatch();
      return true;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }
}
