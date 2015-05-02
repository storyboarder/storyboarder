package sqlutil;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.List;
import java.util.Set;

import org.junit.Test;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;

public class SqlStringTest {
  @Test
  public void constructionNoParamsTest() {
    SqlString test = SqlString.of("foo");
    assertEquals("foo", test.getSql());
  }

  @Test
  public void constructionOneParamTest() {
    String before = "foo ? derp";
    String after = "foo bar derp";
    SqlString test = SqlString.of(before, "bar");
    assertEquals(after, test.getSql());
  }

  @Test
  public void constructionMoreParamsTest() {
    String before = "foo ? derp ? ?";
    String after = "foo bar derp goo yay";
    List<Object> params = ImmutableList.of("bar", "goo", "yay");
    SqlString test = SqlString.of(before, params);
    assertEquals(after, test.getSql());
  }

  @Test
  public void builderTest() {
    String before = "foo ? derp ? ?";
    String after = "foo bar derp goo yay";

    SqlString test = SqlString.of(before).builder().addParam("bar")
        .addParam("goo").addParam("yay").build();
    assertEquals(after, test.getSql());
  }

  @Test
  public void convertTest() {
    Set<String> commands = ImmutableSet.of("foo", "bar", "derp", "goo", "yay");
    ImmutableSet.Builder<SqlString> sqlCommandsBuilder = new ImmutableSet.Builder<SqlString>();
    for (String command : commands) {
      sqlCommandsBuilder.add(SqlString.of(command));
    }
    Set<SqlString> sqlCommands = sqlCommandsBuilder.build();
    Set<String> converted = SqlString.convert(sqlCommands);

    assertTrue(converted.containsAll(commands));
    assertTrue(commands.containsAll(converted));
  }
}
