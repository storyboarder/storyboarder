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
   * @return a string representation of the object.
   */
  @Override
  public String toString() {
    return sql;
  }

  /**
   * Converts a Set of SqlStrings to a Set of Strings.
   *
   * @param sqlStrings
   *          the Set of SqlStrings.
   * @return A Set of Strings containing the SQL strings stored in the SqlString
   *         objects in the Set of SqlStrings.
   */
  public static Set<String> convert(Set<SqlString> sqlStrings) {
    Set<String> strings = new HashSet<String>();
    for (SqlString sqlString : sqlStrings) {
      strings.add(sqlString.getSql());
    }
    return strings;
  }

  /**
   * @return a builder object for this SqlString.
   */
  public Builder builder() {
    return new Builder();
  }

  /**
   * A class that assigns parameters to '?' characters in an SQL string.
   *
   * @author narobins
   * @author yz38
   * @author ktsakas
   * @author fbystric
   */
  public final class Builder {
    private String preparedSql;

    private Builder() {
      preparedSql = sql;
    }

    /**
     * Assigns the given parameter to the first '?' character in the SQL string.
     *
     * @param param
     *          The parameter to be assigned.
     * @return this, the builder with an updated SQL string.
     */
    public Builder addParam(Object param) {
      preparedSql = preparedSql.replaceFirst("\\?", param.toString());
      return this;
    }

    /**
     * Assigns the given parameters to the first '?' characters in the SQL
     * string.
     *
     * @param params
     *          The list of parameters to be assigned.
     * @return this, the builder with an updated SQL string.
     */
    public Builder addParams(List<Object> params) {
      for (Object param : params) {
        addParam(param);
      }
      return this;
    }

    /**
     * Builds (finalizes) the sql string.
     *
     * @return an SqlString object with the parameters assigned so far.
     */
    public SqlString build() {
      return new SqlString(preparedSql);
    }
  }

}
