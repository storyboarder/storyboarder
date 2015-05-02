package sqlutil;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Represents an SQL query. Helps safely build parametric queries with many
 * parameters.
 *
 * <p>
 * Provides a mechanism to warn if an SQL string has unassigned parameters ('?'
 * characters). For example, you might construct a parametric query of the form
 * 'INSERT INTO ? VALUES(?,?)', then use this class to assign the values. If you
 * forget to assign a value, the builder will throw an error that is more
 * informative than SQL's built-in one.
 *
 * @author narobins
 * @author yz38
 * @author ktsakas
 * @author fbystric
 */
public final class SqlString {
  private final String sql;

  private SqlString(String sql) {
    this.sql = sql;
  }

  /**
   * Constructs and returns an SqlString object with the given SQL string.
   *
   * @param sql
   *          The SQL string.
   * @return an SqlString object with the given SQL string.
   */
  public static SqlString of(String sql) {
    return new SqlString(sql);
  }

  /**
   * Constructs and returns an SqlString object with the given SQL string and
   * parameter. Assigns this parameter to the first '?' character in the SQL
   * string.
   *
   * @param sql
   *          The SQL string.
   * @param constantParam
   *          The parameter that is to be assigned to the first question mark in
   *          'sql.'
   * @return an SqlString object with the given SQL string, with the first
   *         question mark set to 'constantParam.'
   */
  public static SqlString of(String sql, Object constantParam) {
    Builder sqlBuilder = new SqlString(sql).builder();
    sqlBuilder.addParam(constantParam);
    return sqlBuilder.build();
  }

  /**
   * Constructs and returns an SqlString object with the given SQL string and
   * list of parameters. Assigns these parameters in order to the first '?'
   * characters in the SQL string.
   *
   * @param sql
   *          The SQL string.
   * @param constantParams
   *          The parameters that are to be assigned to the first question marks
   *          in 'sql.'
   * @return an SqlString object with the given SQL string, with the first
   *         question marks set to each corresponding value in 'constantParams.'
   */
  public static SqlString of(String sql, List<Object> constantParams) {
    Builder sqlBuilder = new SqlString(sql).builder();
    sqlBuilder.addParams(constantParams);
    return sqlBuilder.build();
  }

  /**
   * @return true if the SQL string is ready to be executed (contains no '?'
   *         characters, false otherwise.
   */
  public boolean ready() {
    return !sql.contains("?");
  }

  /**
   * @return the SQL string stored in this object, if it is ready. If it is not
   *         ready, an error is thrown.
   */
  public String getSql() {
    if (!ready()) {
      throw new UnsupportedOperationException(
          "Need to add more params before calling build!");
    }
    return sql;
  }

  /**
   * @see java.lang.Object#toString()
   */
  @Override
  public String toString() {
    return sql;
  }

  /**
   *
   * @param sqlStrings
   * @return
   */
  public static Set<String> convert(Set<SqlString> sqlStrings) {
    Set<String> strings = new HashSet<String>();
    for (SqlString sqlString : sqlStrings) {
      strings.add(sqlString.getSql());
    }
    return strings;
  }

  public Builder builder() {
    return new Builder();
  }

  public class Builder {
    private String preparedSql;

    private Builder() {
      preparedSql = sql;
    }

    public Builder addParam(Object param) {
      preparedSql = preparedSql.replaceFirst("\\?", param.toString());
      return this;
    }

    public Builder addParams(List<Object> params) {
      for (Object param : params) {
        addParam(param);
      }
      return this;
    }

    public SqlString build() {
      return new SqlString(preparedSql);
    }
  }

}
