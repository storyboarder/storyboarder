package sqlUtil;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Set;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import com.google.common.collect.ImmutableSet;

public class SqlQueryerTest {
  private static final String NAME = "test.sqlite3";
  private static final Path DB_PATH = Paths.get(NAME);

  private static final String TABLE_1 = "stringsAndInts";
  private static final String TABLE_2 = "justStrings";

  private static SqlQueryer queryer;

  @BeforeClass
  public static void createDb() throws ClassNotFoundException, SQLException,
    IOException {
    Files.deleteIfExists(DB_PATH);
    queryer = new SqlQueryer(DB_PATH);
    String table1 = "CREATE TABLE " + TABLE_1 + " (strings TEXT, ints INTEGER)";
    String table2 = "CREATE TABLE " + TABLE_2 + " (strings TEXT)";
    queryer.execute(table1);
    queryer.execute(table2);
  }

  @AfterClass
  public static void deleteDb() throws IOException {
    Files.deleteIfExists(DB_PATH);
  }

  @Test
  public void existsTest() {
    assertTrue(Files.exists(DB_PATH));
  }

  @Test
  public void hasTablesTest() throws SQLException {
    String sql = "SELECT tbl_name FROM sqlite_master WHERE type = 'table'";
    ResultSet tables = queryer.query(sql);
    assertTrue(tables.next());
    assertEquals(TABLE_1, tables.getString(1));

    assertTrue(tables.next());
    assertEquals(TABLE_2, tables.getString(1));
  }

  @Test
  public void addRemoveContainsTest() throws SQLException {
    Set<String> additions = new ImmutableSet.Builder<String>()
        .add("INSERT INTO " + TABLE_1 + " VALUES('fooo', 1);\n")
        .add("INSERT INTO " + TABLE_1 + " VALUES('fooo', 2);\n")
        .add("INSERT INTO " + TABLE_1 + " VALUES('fooo', 3);\n")
        .add("INSERT INTO " + TABLE_1 + " VALUES('fooo', 4);\n")
        .add("INSERT INTO " + TABLE_1 + " VALUES('fooo', 5);")
        .build();
    assertTrue(queryer.executeBatch(additions));

    String getAll = "SELECT * FROM " + TABLE_1;
    ResultSet rs = queryer.query(getAll);
    for (int i = 1; i <= 5; i++) {
      assertTrue(rs.next());
      assertTrue(i == rs.getInt(2));
    }

    String contains = "SELECT * FROM " + TABLE_1 + " WHERE ints = 3";
    ResultSet result = queryer.query(contains);
    assertTrue(result.next());
    assertFalse(result.next());

    String remove = "DELETE FROM " + TABLE_1 + " WHERE ints = 3";
    assertTrue(queryer.execute(remove));

    contains = "SELECT * FROM " + TABLE_1 + " WHERE ints = 3";
    result = queryer.query(contains);
    assertFalse(result.next());

    contains = "SELECT * FROM " + TABLE_1 + " WHERE ints = 1";
    result = queryer.query(contains);
    assertTrue(result.next());
    assertFalse(result.next());

    contains = "SELECT * FROM " + TABLE_1 + " WHERE ints = 4";
    result = queryer.query(contains);
    assertTrue(result.next());
    assertFalse(result.next());

  }
}
