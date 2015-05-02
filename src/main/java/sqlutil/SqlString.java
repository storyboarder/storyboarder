package sqlutil;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SqlString {
  private final String sql;

  private SqlString(String sql) {
    this.sql = sql;
  }

  public static SqlString of(String sql) {
    return new SqlString(sql);
  }

  public static SqlString of(String sql, Object constantParam) {
    Builder sqlBuilder = new SqlString(sql).builder();
    sqlBuilder.addParam(constantParam);
    return sqlBuilder.build();
  }

  public static SqlString of(String sql, List<Object> constantParams) {
    Builder sqlBuilder = new SqlString(sql).builder();
    sqlBuilder.addParams(constantParams);
    return sqlBuilder.build();
  }

  public boolean ready() {
    return !sql.contains("?");
  }

  public String getSql() {
    if (!ready()) {
      throw new UnsupportedOperationException(
          "Need to add more params before calling build!");
    }
    return sql;
  }

  @Override
  public String toString() {
    return sql;
  }

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
