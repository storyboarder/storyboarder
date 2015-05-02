package sqlutil;

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

public class SqlQueryer {
  private final Connection conn;

  public SqlQueryer(Path path) throws SQLException, ClassNotFoundException {
    Class.forName("org.sqlite.JDBC");
    conn = DriverManager.getConnection("jdbc:sqlite:" + path);
  }

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

  // public ResultSet query(String query) throws SQLException {
  // PreparedStatement prep = conn.prepareStatement(query);
  // ResultSet rs = prep.executeQuery();
  // return prep.executeQuery();
  // }

  public boolean execute(String statement) {
    try (Statement stat = conn.createStatement()) {
      stat.execute(statement);
      return true;
    } catch (SQLException e) {
      e.printStackTrace();
      return false;
    }
  }

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
