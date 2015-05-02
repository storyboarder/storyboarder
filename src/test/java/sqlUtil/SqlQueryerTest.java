package sqlutil;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
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
  public void hasTablesTest() {
    String sql = "SELECT tbl_name FROM sqlite_master WHERE type = 'table'";
    List<String> tables = queryer.query(sql,
        ResultConverters.singleColumnConverter(1, String.class));
    assertEquals(2, tables.size());
    assertEquals(TABLE_1, tables.get(0));
    assertEquals(TABLE_2, tables.get(1));
  }

  private static class StringInt {
    public String str;
    public int num;

    public StringInt(String str, int num) {
      this.str = str;
      this.num = num;
    }

    public static final ResultConverter<StringInt> CONVERTER = new ResultConverter<StringInt>() {
      @Override
      public StringInt convert(ResultSet rs) throws SQLException {
        return new StringInt(rs.getString(1), rs.getInt(2));
      }
    };
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

    List<StringInt> results = queryer.query(getAll, StringInt.CONVERTER);
    assertEquals(5, results.size());
    for (int i = 0; i < results.size(); i++) {
      assertEquals("fooo", results.get(i).str);
      assertEquals(i + 1, results.get(i).num);
    }

    String sql = "SELECT * FROM " + TABLE_1 + " WHERE ints = 3";
    results = queryer.query(sql, StringInt.CONVERTER);
    assertEquals(1, results.size());
    assertEquals(3, results.get(0).num);

    String remove = "DELETE FROM " + TABLE_1 + " WHERE ints = 3";
    assertTrue(queryer.execute(remove));

    sql = "SELECT * FROM " + TABLE_1 + " WHERE ints = 3";
    results = queryer.query(sql, StringInt.CONVERTER);
    assertEquals(0, results.size());

    sql = "SELECT * FROM " + TABLE_1 + " WHERE ints = 1";
    results = queryer.query(sql, StringInt.CONVERTER);
    assertEquals(1, results.size());
    assertEquals(1, results.get(0).num);

    sql = "SELECT * FROM " + TABLE_1 + " WHERE ints = 4";
    results = queryer.query(sql, StringInt.CONVERTER);
    assertEquals(1, results.size());
    assertEquals(4, results.get(0).num);

  }
}
