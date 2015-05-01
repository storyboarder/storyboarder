package sqlUtil;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Set;

public class SqlQueryer {
  private final Connection conn;

  public SqlQueryer(Path path) throws SQLException, ClassNotFoundException {
    Class.forName("org.sqlite.JDBC");
    conn = DriverManager.getConnection("jdbc:sqlite:" + path);
  }

  public ResultSet query(String query) throws SQLException {
    PreparedStatement prep = conn.prepareStatement(query);
    return prep.executeQuery();
  }

  public boolean execute(String statement) {
    try (Statement stat = conn.createStatement()) {
      stat.execute(statement);
      return true;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

  public boolean executeBatch(Set<String> statements) {
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
